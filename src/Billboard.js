import { ethers } from 'ethers';
import { useEffect, useState, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { contractAddress } from './App';
import "./Billboard.css"
import BottomMenu from './BottomMenu';
import BILLBOARD_ABI from './contracts/nft-billboard.json';

export const SELECTION_STATES = {
    None: "None",
    Selecting: "Selecting",
    Done: "Done",
    PickedOwnNFT: "PickedOwnNFT",
    Drawing: "Drawing",
}

const NUM_COLS = 1300
const NUM_ROWS = 1000
export const CELL_WIDTH = 10 // px
export const CELL_HEIGHT = 10 // px
const TOOLTIP_WIDTH = 150 // px


// Apple Macintosh default 16-color palette
export const colors = [
    '#ffffff', '#fcf305', '#ff6402', '#dd0806', '#f20884', '#4600a5', '#0000d4', '#02abea',
    '#1fb714', '#006411', '#562c05', '#90713a', '#c0c0c0', '#808080', '#404040', '#000000',
];

function Tooltip(props) {
    let { left, top } = props.mousePosition;
    left += 10;
    top += 10;

    if (left > 2/3 * NUM_COLS) {
        left -= TOOLTIP_WIDTH + 30;

    }
    const { hoveredNFT } = props;

    const [owner, setOwner] =  useState(0);
    useEffect(() => {
        props.billboardContract.ownerOf(hoveredNFT.tokenId)
            .then((o) => setOwner(o));
    }, []);


    return (
        <div style={{width: TOOLTIP_WIDTH + "px",
                    display: 'flex',
                    left,
                    top,
                    backgroundColor: '#282c34', position: 'absolute', cursor: 'default',
                    padding: "12px",
                    flexDirection: "column",
                    justifyContent: "start",
                    fontSize: "12px"}}>
            <div style={{lineHeight: 1.5, marginBottom: "5px"}}>
                <p style={{margin: 0, color: 'white', fontWeight: 'bold'}}>Owner:</p>
                <p style={{margin: 0, color: 'white'}}>
                    {owner.toString().substring(0, 20)}
                </p>
            </div>
            <div style={{lineHeight: 1.5, marginTop: "5px"}}>
                <p style={{margin: 0, color: 'white', fontWeight: 'bold'}}>Size:</p>
                <p style={{margin: 0, color: 'white'}}>{(hoveredNFT.endX - hoveredNFT.startX) / CELL_WIDTH * (hoveredNFT.endY - hoveredNFT.startY) / CELL_WIDTH} pixels</p>
            </div>
        </div>
    )
}

const parseAllArt = (arts) => {
    let allArts = [];

    for (let i = 0; i < arts.length; i++) {
        allArts.push({
            tokenId: i,
            startX: arts[i][0][0] * CELL_WIDTH,
            endX: arts[i][0][1] * CELL_WIDTH,
            startY: arts[i][0][2] * CELL_HEIGHT,
            endY: arts[i][0][3] * CELL_HEIGHT,
            data: arts[i][1]
        });
    }

    return allArts;
}



const removeHashFromOngoingMints = (hash) => {
    let ongoingMints = JSON.parse(localStorage.getItem("ongoingMints"));
    const index = ongoingMints.indexOf(hash);
    if (index > -1) {
        ongoingMints.splice(index, 1);
    }
    localStorage.setItem("ongoingMints", JSON.stringify(ongoingMints));
}

const removeHashFromOngoingDraws = (hash) => {
    let ongoingDraws = JSON.parse(localStorage.getItem("ongoingDraws"));
    const index = ongoingDraws.indexOf(hash);
    if (index > -1) {
        ongoingDraws.splice(index, 1);
    }
    localStorage.setItem("ongoingDraws", JSON.stringify(ongoingDraws));
}

export default function Billboard(props) {
    const cvRef = useRef(null);
    const cursorRef = useRef(null);
    const { currentAccount } = props;
    const provider = ((window.ethereum != null) ? new ethers.providers.Web3Provider(window.ethereum) : ethers.providers.getDefaultProvider());
    const signer = provider.getSigner();
    const billboardContract = new ethers.Contract(contractAddress, BILLBOARD_ABI, signer);

    const loadNFTs = async () => {
        const n = parseAllArt(await billboardContract.getAllArt());
        setInitialNFTs(structuredClone(n));
        setNFTs(structuredClone(n));

        const ownedIds = await billboardContract.getIdsOwned();
        let owned = [];
        for (let i = 0; i < ownedIds.length; i++) {
            owned.push(structuredClone(n[ownedIds[i]]));
        }
        setOwnNFTs(owned);
    }

    const fireToastForMint = (hash) => {
        const statusPromise = provider.waitForTransaction(hash).then(() => removeHashFromOngoingMints(hash));
        toast.promise(
            statusPromise,
            {
                pending: "Minting in progress",
                success: {
                    render() {
                        return (
                            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 0}}>
                                <p style={{margin: 0}}>Minted!</p>
                                <button onClick={() => { window.location.reload(); }}
                                    style={{
                                    margin: 0,
                                    height: "25px", fontSize: '14px', fontWeight: 500,
                                    border: 0, outline: 0, color: 'white', backgroundColor: 'rgb(84, 105, 212)',
                                    boxShadow: "rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 12%) 0px 1px 1px 0px, rgb(84 105 212) 0px 0px 0px 1px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(60 66 87 / 8%) 0px 2px 5px 0px;",
                                    borderRadius: '4px', cursor: 'pointer'}}>Reload</button>
                            </div>
                        )
                    }
                },
                error: "Error while minting..",
            }
        );

        const ongoingMints = JSON.parse(localStorage.getItem("ongoingMints")) || [];
        localStorage.setItem("ongoingMints", JSON.stringify([...ongoingMints, hash]));
    }

    const loadOngoingMints = async () => {
        const ongoingMints = JSON.parse(localStorage.getItem("ongoingMints")) || [];
        for (let i = 0; i < ongoingMints.length; i++) {
            const txReceipt = await provider.getTransactionReceipt(ongoingMints[i]);

            if (!txReceipt) {
                fireToastForMint(ongoingMints[i]);
            } else {
                removeHashFromOngoingMints(ongoingMints[i]);
            }
        }
    }

    const fireToastForDraw = (hash) => {
        const statusPromise = provider.waitForTransaction(hash).then(() => removeHashFromOngoingDraws(hash));
        toast.promise(
            statusPromise,
            {
                pending: "Drawing in progress",
                success: {
                    render() {
                        return (
                            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 0}}>
                                <p style={{margin: 0}}>Art updated!</p>
                                <button onClick={() => { window.location.reload(); }}
                                    style={{
                                    margin: 0,
                                    height: "25px", fontSize: '14px', fontWeight: 500,
                                    border: 0, outline: 0, color: 'white', backgroundColor: 'rgb(84, 105, 212)',
                                    boxShadow: "rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 12%) 0px 1px 1px 0px, rgb(84 105 212) 0px 0px 0px 1px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(60 66 87 / 8%) 0px 2px 5px 0px;",
                                    borderRadius: '4px', cursor: 'pointer'}}>Reload</button>
                            </div>
                        )
                    }
                },
                error: "Error while drawing..",
            }
        );

        const ongoingDraws = JSON.parse(localStorage.getItem("ongoingDraws")) || [];
        localStorage.setItem("ongoingDraws", JSON.stringify([...ongoingDraws, hash]));
    }

    const loadOngoingDraws = async () => {
        const ongoingDraws = JSON.parse(localStorage.getItem("ongoingDraws")) || [];
        for (let i = 0; i < ongoingDraws.length; i++) {
            const txReceipt = await provider.getTransactionReceipt(ongoingDraws[i]);

            if (!txReceipt) {
                fireToastForDraw(ongoingDraws[i]);
            } else {
                removeHashFromOngoingDraws(ongoingDraws[i]);
            }
        }
    }

    useEffect(() => {
        (
            async () => {
                drawBillboard();
                drawGrid();

                await loadNFTs();
                await loadOngoingMints();
                await loadOngoingDraws();
            }
        )()
    }, []);

    const [selectionState, setSelectionState] = useState(SELECTION_STATES.None);
    const [selectionCoords, setSelectionCoords] = useState(null);
    const [ownNFTs, setOwnNFTs] = useState(null);
    const [pickedOwnNFT, setPickedOwnNFT] = useState(null);
    const [currentColor, setCurrentColor] = useState(0);
    const [initialNFTs, setInitialNFTs] = useState([]);
    const [nfts, setNFTs] = useState([]);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState({
        left: 0,
        top: 0,
    })
    const [hoveredNFT, setHoveredNFT] = useState(null);

    const drawBillboard = () => {
        const c = cvRef.current;
        const ctx = c.getContext("2d");

        ctx.beginPath();

        const oldFillStyle = ctx.fillStyle;

        for (let i = 0; i < nfts?.length; i++) {
            const startX = nfts[i].startX;
            const startY = nfts[i].startY;
            const width = (nfts[i].endX - nfts[i].startX) / CELL_WIDTH;
            const height = (nfts[i].endY - nfts[i].startY) / CELL_HEIGHT;
            const data = nfts[i].data;


            for (let u = 0; u < width; u++) {
                for (let v = 0; v < height; v++) {
                    ctx.fillStyle = colors[data[u + v*width]];
                    ctx.fillRect(startX + u * CELL_WIDTH, startY + v * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
                }
            }
        }

        ctx.fillStyle = oldFillStyle;
    }

    const drawGrid = () => {
        const c = cvRef.current;
        const ctx = c.getContext("2d");
        ctx.beginPath();
        const oldStrokeStyle = ctx.strokeStyle;
        ctx.strokeStyle = "#ccc";

        for (let i = 0; i < NUM_COLS; i++) {
            ctx.moveTo(i * CELL_WIDTH, 0);
            ctx.lineTo(i * CELL_WIDTH, NUM_ROWS);
        }

        for (let i = 0; i < NUM_ROWS; i++) {
            ctx.moveTo(0, i * CELL_HEIGHT);
            ctx.lineTo(NUM_COLS, i * CELL_HEIGHT);
        }

        ctx.stroke();
        ctx.strokeStyle = oldStrokeStyle;
    }

    const clearCanvas = () => {
        const c = cvRef.current;
        const ctx = c.getContext("2d");

        ctx.clearRect(0, 0, c.width, c.height);
    }

    const getCollidingNFT = (nfts, currentX, currentY) => {
        for (let i = 0; i < nfts?.length; i++) {
            const nft = nfts[i];
            if (currentX >= nft.startX && currentX <= nft.endX
                && currentY >= nft.startY && currentY <= nft.endY) {
                    return nft;
                }
        }

        return null;
    }

    const updateCursorPosition = (ev) => {
        const canvas = cvRef.current;
        const bounding = canvas.getBoundingClientRect();

        const cursorLeft = canvas.offsetLeft + ev.clientX - bounding.left - (cursorRef.current.offsetWidth / 2);
        const cursorTop = canvas.offsetTop + ev.clientY - bounding.top - (cursorRef.current.offsetHeight / 2);

        cursorRef.current.style.left = Math.floor(cursorLeft / CELL_WIDTH) * CELL_WIDTH + "px";
        cursorRef.current.style.top = Math.floor(cursorTop / CELL_HEIGHT) * CELL_HEIGHT + "px";

        if (selectionState == SELECTION_STATES.Selecting) {
            clearOutlineNFTs();

            const ctx = canvas.getContext("2d");

            // clear previous selection
            clearCanvas();
            drawBillboard();

            const x = ev.clientX - bounding.left - (cursorRef.current.offsetWidth / 2);
            let currentX = Math.floor(x / CELL_WIDTH) * CELL_WIDTH;

            if (currentX >= selectionCoords.startX) {
                currentX += CELL_WIDTH;
            }

            const y = ev.clientY - bounding.top - (cursorRef.current.offsetHeight / 2);
            let currentY = Math.floor(y / CELL_HEIGHT) * CELL_HEIGHT;

            if (currentY >= selectionCoords.startY) {
                currentY += CELL_HEIGHT;
            }

            const width = currentX - selectionCoords.startX;
            const height = currentY - selectionCoords.startY;

            ctx.beginPath();
            ctx.fillStyle = "red";
            ctx.fillRect(selectionCoords.startX, selectionCoords.startY, width, height);
            setSelectionCoords({ ...selectionCoords, width, height })

            drawGrid();
        } else if (selectionState == SELECTION_STATES.None || selectionState == SELECTION_STATES.PickedOwnNFT ) {
            // Handle outlines
            clearOutlineNFTs();

            if (pickedOwnNFT) {
                outlineOneNFT(pickedOwnNFT);
            }

            const x = ev.clientX - bounding.left - (cursorRef.current.offsetWidth / 2);
            let currentX = Math.floor(x / CELL_WIDTH) * CELL_WIDTH;

            const y = ev.clientY - bounding.top - (cursorRef.current.offsetHeight / 2);
            let currentY = Math.floor(y / CELL_HEIGHT) * CELL_HEIGHT;

            const ownNFT = getCollidingNFT(ownNFTs, currentX, currentY);
            if (ownNFT) {
                outlineOneNFT(ownNFT);
            }

            // Handle tooltip
            const nft = getCollidingNFT(nfts, currentX, currentY);
            if (nft) {
                cursorRef.current.style.display = 'none';
                cursorRef.current.style.cursor = 'default'
                cvRef.current.style.cursor = 'default';
                setTooltipVisible(true);
                setMousePosition({ left: ev.pageX, top: ev.pageY });
                setHoveredNFT(nft);
            } else {
                cursorRef.current.style.display = 'block';
                cursorRef.current.style.cursor = 'none';
                cvRef.current.style.cursor = 'none';
                setTooltipVisible(false);
            }
        }

    }

    const startSelection = (ev) => {
        const canvas = cvRef.current;
        const bounding = canvas.getBoundingClientRect();

        const x = ev.clientX - bounding.left - (cursorRef.current.offsetWidth / 2);
        const currentX = Math.floor(x / CELL_WIDTH) * CELL_WIDTH;

        const y = ev.clientY - bounding.top - (cursorRef.current.offsetHeight / 2);
        const currentY = Math.floor(y / CELL_HEIGHT) * CELL_HEIGHT;

        if (selectionState == SELECTION_STATES.Drawing) {
            if (currentX < pickedOwnNFT.startX || currentX > pickedOwnNFT.endX
                || currentY < pickedOwnNFT.startY || currentY > pickedOwnNFT.endY)
            {
                return;
            }

            const nftIndex = nfts.findIndex((n) => n.startX == pickedOwnNFT.startX && n.startY == pickedOwnNFT.startY);
            const nftWidth = (pickedOwnNFT.endX - pickedOwnNFT.startX) / CELL_WIDTH;
            const nftX = (currentX - pickedOwnNFT.startX) / CELL_WIDTH;
            const nftY = (currentY - pickedOwnNFT.startY) / CELL_HEIGHT;
            const dataIndex = nftX + nftWidth * nftY;

            nfts[nftIndex].data[dataIndex] = currentColor;

            clearCanvas();
            drawBillboard();
            drawGrid();
            outlineOneNFT(pickedOwnNFT);

            return;
        }


        const existingOwnNFT = getCollidingNFT(ownNFTs, currentX, currentY);
        if (existingOwnNFT) {
            setPickedOwnNFT(existingOwnNFT);
            setSelectionState(SELECTION_STATES.PickedOwnNFT);

            outlineOneNFT(existingOwnNFT);

            return;
        } else if (getCollidingNFT(nfts, currentX, currentY)) {
            setSelectionState(SELECTION_STATES.None);

            setPickedOwnNFT(null);
            clearOutlineNFTs();
            return;
        }

        setSelectionState(SELECTION_STATES.Selecting);
        setPickedOwnNFT(null);

        setSelectionCoords({ startX: currentX, startY: currentY });
    }

    const endSelection = (ev) => {
        if (selectionState != SELECTION_STATES.Selecting) {
            return;
        }
        setSelectionState(SELECTION_STATES.Done);
        setPickedOwnNFT(null);
    }

    const disableCursor = () => {
        cursorRef.current.style.display = 'none';
    }

    const enableCursor = () => {
        cursorRef.current.style.display = 'block';
    }

    const onMint = async () => {
        const x = selectionCoords.startX / CELL_WIDTH;
        const y = selectionCoords.startY / CELL_HEIGHT;
        const width = selectionCoords.width / CELL_WIDTH;
        const height = selectionCoords.height / CELL_HEIGHT;

        let startX = x;
        let endX = x + width;
        if (width < 0) {
            const tmp = startX;
            startX = endX;
            endX = tmp;
        }

        let startY = y;
        let endY = y + height;
        if (height < 0) {
            const tmp = startY;
            startY = endY;
            endY = tmp;
        }

        const size = (endX - startX)*(endY - startY);
        const pricePerPixel = await billboardContract.pixelPrice();

        const mint = await billboardContract.mint(
            startX,
            endX,
            startY,
            endY,
            {
                value: pricePerPixel.mul(size),
                gasLimit: 5999999,
                from: currentAccount
            });

        fireToastForMint(mint.hash);
    }

    const onClickDraw = () => {
        setSelectionState(SELECTION_STATES.Drawing);
        pickColor(0);
    }

    const onClearSelection = () => {
        setSelectionCoords(null);
        setSelectionState(SELECTION_STATES.None);
        setPickedOwnNFT(null);

        // clear previous selection
        clearCanvas();
        drawBillboard();
        drawGrid();
    }

    const outlineOneNFT = (nft) => {
        const c = cvRef.current;
        const ctx = c.getContext("2d");

        ctx.strokeStyle = "orange";
        const oldLineWidth = ctx.lineWidth;
        ctx.lineWidth = 3;
        ctx.strokeRect(nft.startX, nft.startY, nft.endX - nft.startX, nft.endY - nft.startY);
        ctx.lineWidth = oldLineWidth;

        return;
    }

    const outlineMultipleNFTs = (nfts) => {
        clearCanvas();

        const c = cvRef.current;
        const ctx = c.getContext("2d");

        drawBillboard();
        drawGrid();

        ctx.strokeStyle = "orange";
        const oldLineWidth = ctx.lineWidth;
        ctx.lineWidth = 3;


        for (let i = 0; i < nfts?.length; i++) {
            ctx.strokeRect(nfts[i].startX, nfts[i].startY, nfts[i].endX - nfts[i].startX, nfts[i].endY - nfts[i].startY);
        }


        ctx.lineWidth = oldLineWidth;

        return;
    }

    const clearOutlineNFTs = () => {
        clearCanvas();
        drawBillboard();
        drawGrid();
    }

    const onCancelDraw = () => {
        setSelectionState(SELECTION_STATES.None);
        setPickedOwnNFT(null);
        setNFTs(initialNFTs);
        clearOutlineNFTs();
        cursorRef.current.style.backgroundColor = 'transparent';
    }

    const onSubmitDraw = async () => {
        const tokenId = nfts.findIndex((n) => n.startX == pickedOwnNFT.startX && n.startY == pickedOwnNFT.startY);

        const data = nfts[tokenId].data;

        const draw = await billboardContract.updateArt(
            tokenId,
            data,
            {
                gasLimit: 5999999,
                from: currentAccount,
            }
        );

        fireToastForDraw(draw.hash);
    }

    const pickColor = (index) => {
        setCurrentColor(index);
        cursorRef.current.style.backgroundColor = colors[index];
    }

    return (
        <div className="billboard-container">
            <canvas id="canvas" ref={cvRef} width={NUM_COLS} height={NUM_ROWS}
                onMouseMove={updateCursorPosition}
                onMouseDown={startSelection}
                onMouseUp={endSelection}
                onMouseLeave={() => setTooltipVisible(false)}s
            >
            </canvas>
            <div id="cursor"
                ref={cursorRef}
                onMouseDown={startSelection}
                onMouseUp={endSelection}
            ></div>
            <BottomMenu
                onMouseEnter={disableCursor}
                onMouseLeave={enableCursor}
                selectionCoords={selectionCoords}
                selectionState={selectionState}
                onMint={onMint}
                onClearSelection={onClearSelection}
                ownNFTs={ownNFTs}
                outlineMultipleNFTs={outlineMultipleNFTs}
                clearOutlineNFTs={clearOutlineNFTs}
                pickedOwnNFT={pickedOwnNFT}
                onClickDraw={onClickDraw}
                onCancelDraw={onCancelDraw}
                onSubmitDraw={onSubmitDraw}
                onPickColor={pickColor}
            />
            {tooltipVisible && <Tooltip mousePosition={mousePosition} hoveredNFT={hoveredNFT} billboardContract={billboardContract} />}
            <ToastContainer position='top-right'/>
        </div>
    );
}