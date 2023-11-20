// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Billboard is ERC721, Ownable {

    struct Tuple {
        uint256 leftX;
        uint256 rightX;
        uint256 topY;
        uint256 bottomY;
    }

    uint256 constant gridSize = 1000;
    uint256 private _nextTokenId;
    bool[gridSize*gridSize] public coordTaken;
    mapping(uint256 => Tuple) public idToCoordinates;
    mapping(uint256 => uint256[]) public idToArt;

    constructor(address initialOwner)
        ERC721("Billboard", "BILLBOARD")
        Ownable(initialOwner)
    {}

    function safeMint(address to, uint256 leftX, uint256 rightX, uint256 topY, uint256 bottomY) public {
        
        // ensuring valid coordinates
        require(leftX <= rightX && topY <= bottomY, "Invalid Coordinates: Backwards x ordering");
        require(leftX >= 0 && topY >= 0, "Invalid Coordinates: Must be >= 0");
        require(bottomY <= gridSize && rightX <= gridSize, "Invalid Coordinates: Must be <= GridSize");
        
        // ensures no collisions with previously minted tokens and also stores new coords on collision map
        Tuple memory coords = Tuple(leftX, rightX, topY, bottomY);
        checkCollisions(coords);

        uint256 tokenId = _nextTokenId++;
        idToCoordinates[tokenId] = coords;

        _safeMint(to, tokenId);
    }

    function updateArt(uint256 tokenId, uint256[] calldata art) public {
        
        require(msg.sender == ownerOf(tokenId));
        Tuple memory coords = idToCoordinates[tokenId];
        require(art.length == (coords.rightX - coords.leftX + 1)*(coords.bottomY - coords.topY + 1));

        idToArt[tokenId] = art;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {

    }

    function checkCollisions(Tuple memory coords) internal {
        
        for (uint256 x = coords.leftX; x <= coords.rightX; x++) {
            for (uint256 y = coords.topY; y <= coords.bottomY; y++) {

                require(!coordTaken[x + y*gridSize], "Invalid Coordinates: Coordinates unavailable");

                coordTaken[x + y*gridSize] = true;

            }
        }
    }

}
