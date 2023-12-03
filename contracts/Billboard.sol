// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract Billboard is ERC721, Ownable {

    using Strings for uint256;

    struct Tuple {
        uint256 leftX;
        uint256 rightX;
        uint256 topY;
        uint256 bottomY;
    }

    struct ArtAndCoords {
        Tuple coords;
        uint8[] art;
    }

    uint256 constant gridWidth = 130;
    uint256 constant gridHeight = 100;
    uint256 private _nextTokenId;
    bool[gridWidth*gridHeight] public coordTaken;
    uint8[gridWidth*gridHeight] public colorGrid;
    mapping(uint256 => Tuple) public idToCoordinates;
    mapping(uint256 => uint8[]) public idToArt;

    mapping(uint8 => string) public palette;

    constructor(address initialOwner)
        ERC721("Billboard", "BILLBOARD")
        Ownable(initialOwner)
    {
        palette[0] = "#FFFFFF";
        palette[1] = "#FFFF00";
        palette[2] = "#FFA500";
        palette[3] = "#FF0000";
        palette[4] = "#FF00FF";
        palette[5] = "#800080";
        palette[6] = "#0000FF";
        palette[7] = "#00FFFF";
        palette[8] = "#008000";
        palette[9] = "#023020";
        palette[10] = "#A52A2A";
        palette[11] = "#D2B48C";
        palette[12] = "#D3D3D3";
        palette[13] = "#808080";
        palette[14] = "#A9A9A9";
        palette[15] = "#000000";
    }

    function mint(uint256 leftX, uint256 rightX, uint256 topY, uint256 bottomY) public {
        safeMint(msg.sender, leftX, rightX, topY, bottomY);
    }

    function safeMint(address to, uint256 leftX, uint256 rightX, uint256 topY, uint256 bottomY) public {
        
        // ensuring valid coordinates
        require(leftX <= rightX && topY <= bottomY, "Invalid Coordinates: Backwards x ordering");
        require(leftX >= 0 && topY >= 0, "Invalid Coordinates: Must be >= 0");
        require(bottomY < gridHeight && rightX < gridWidth, "Invalid Coordinates: Must be < GridSize");
        
        // ensures no collisions with previously minted tokens and also stores new coords on collision map
        Tuple memory coords = Tuple(leftX, rightX, topY, bottomY);
        checkCollisions(coords);

        uint256 tokenId = _nextTokenId++;
        idToCoordinates[tokenId] = coords;

        _safeMint(to, tokenId);

        uint256 width = coords.rightX - coords.leftX + 1;
        uint256 height = coords.bottomY - coords.topY + 1;
        idToArt[tokenId] = new uint8[](height*width);
    }

    function updateArt(uint256 tokenId, uint8[] calldata art) public {
        
        require(msg.sender == ownerOf(tokenId));
        Tuple memory coords = idToCoordinates[tokenId];
        require(art.length == (coords.rightX - coords.leftX + 1)*(coords.bottomY - coords.topY + 1));

        idToArt[tokenId] = art;

        uint256 index = 0;
        for (uint256 y = coords.topY; y < coords.bottomY; y++) {
            for (uint256 x = coords.leftX; x < coords.rightX; x++) {
            
                require(art[index] < 16, "Invalid color entered: must be < 16");
                colorGrid[x + y*gridWidth] = art[index];
                index++;

            }
        }
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {

        bytes memory dataURI = abi.encodePacked(
            '{',
                '"name": "Billboard #', tokenId.toString(), '", ',
                '"image": "', 'data:image/svg+xml;base64,', Base64.encode(bytes(buildSVG(tokenId))), '"'
            '}'
        );

        string memory metadata = string(abi.encodePacked("data:application/json;base64,", Base64.encode(dataURI)));

        return metadata;

    }

    function buildSVG(uint256 tokenId) public view returns (string memory){

        Tuple memory coords = idToCoordinates[tokenId];
        uint256 width = coords.rightX - coords.leftX + 1;
        uint256 height = coords.bottomY - coords.topY + 1;
        uint256 pixelSize;

        if (width >= height) {
            pixelSize = 100/width;
        }
        else {
            pixelSize = 100/height;
        }

        string memory svg = "<svg width=\"100%\" height=\"100%\" xmlns=\"http://www.w3.org/2000/svg\">";
        uint8[] memory art = idToArt[tokenId];

        uint index = 0;
        for (uint256 y = 0; y < height; y++) {

            for (uint256 x = 0; x < width; x++) {

                svg = string(abi.encodePacked(svg, "<rect x=\""));
                svg = string(abi.encodePacked(svg, (x*pixelSize).toString()));
                svg = string(abi.encodePacked(svg, "%\" y=\""));
                svg = string(abi.encodePacked(svg, (y*pixelSize).toString()));
                svg = string(abi.encodePacked(svg, "%\" width=\""));
                svg = string(abi.encodePacked(svg, pixelSize.toString()));
                svg = string(abi.encodePacked(svg, "%\" height=\""));
                svg = string(abi.encodePacked(svg, pixelSize.toString()));
                svg = string(abi.encodePacked(svg, "%\" fill=\""));
                svg = string(abi.encodePacked(svg, palette[art[index]]));
                svg = string(abi.encodePacked(svg, "\" />"));

                index++;
            }
        }

        svg = string(abi.encodePacked(svg, "</svg>"));

        return svg;
    }

    function concat(string memory a, string memory b) internal pure returns(string memory){
        return string(abi.encodePacked(a, b));
    }

    function checkCollisions(Tuple memory coords) internal {
        
        for (uint256 x = coords.leftX; x <= coords.rightX; x++) {
            for (uint256 y = coords.topY; y <= coords.bottomY; y++) {

                require(!coordTaken[x + y*gridWidth], "Invalid Coordinates: Coordinates unavailable");

                coordTaken[x + y*gridWidth] = true;

            }
        }
    }

    function getAllArt() external view returns (ArtAndCoords[] memory) {

        ArtAndCoords[] memory allArt = new ArtAndCoords[](_nextTokenId);

        for (uint256 tokenId = 0; tokenId < _nextTokenId; tokenId++) {
            allArt[tokenId] = ArtAndCoords(idToCoordinates[tokenId], idToArt[tokenId]);
        }

        return allArt;   
    }

}
