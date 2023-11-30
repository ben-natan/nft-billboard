import { useEffect, useState, useRef } from 'react';
import "./Billboard.css"
import BottomMenu from './BottomMenu';

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


const nft1 = {
    startX: 1100,
    startY: 10,
    endX: 1210,
    endY: 120,
    data: Array(11 * 11).fill(1),
}

for (let i = 0; i < 11; i++) {
    nft1.data[i] = 4;
    nft1.data[i + 22] = 4;
    nft1.data[i + 44] = 4;
    nft1.data[i + 66] = 4;
    nft1.data[i + 88] = 4;
    nft1.data[i + 110] = 4;
}

const nft2 = {
    startX: 300,
    startY: 0,
    endX: 700,
    endY: 300,
    data: Array(40 * 30).fill(2),
}

let allNFTs = [nft1, nft2]

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
            {/* TODO: fetch informations */}
            <div style={{lineHeight: 1.5, marginBottom: "5px"}}>
                <p style={{margin: 0, color: 'white', fontWeight: 'bold'}}>Owner:</p>
                <p style={{margin: 0, color: 'white'}}>0x00000000000000</p>
            </div>
            <div style={{lineHeight: 1.5, marginTop: "5px", marginBottom: "5px"}}>
                <p style={{margin: 0, color: 'white', fontWeight: 'bold'}}>Last minted for:</p>
                <p style={{margin: 0, color: 'white'}}>0.34 ETH</p>
            </div>
            <div style={{lineHeight: 1.5, marginTop: "5px"}}>
                <p style={{margin: 0, color: 'white', fontWeight: 'bold'}}>Size:</p>
                <p style={{margin: 0, color: 'white'}}>{(hoveredNFT.endX - hoveredNFT.startX) / CELL_WIDTH * (hoveredNFT.endY - hoveredNFT.startY) / CELL_WIDTH} pixels</p>
            </div>
        </div>
    )
}

export default function Billboard() {
    const cvRef = useRef(null);
    const cursorRef = useRef(null);

    useEffect(() => {
        drawBillboard();
        drawGrid();
        setOwnNFTs(allNFTs);

        // TODO: get nfts
        setInitialNFTs(structuredClone(allNFTs));
        setNFTs(structuredClone(allNFTs));
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

        for (let i = 0; i < nfts.length; i++) {
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
        for (let i = 0; i < nfts.length; i++) {
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

        clearOutlineNFTs();

        const existingOwnNFT = getCollidingNFT(ownNFTs, currentX, currentY);
        if (existingOwnNFT) {
            setPickedOwnNFT(existingOwnNFT);
            setSelectionState(SELECTION_STATES.PickedOwnNFT);

            outlineOneNFT(existingOwnNFT);

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

    const onMint = () => {
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

        // TODO: send this to the chain to mint
        console.log({ startX, startY, endX, endY });
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


        for (let i = 0; i < nfts.length; i++) {
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

    const onSubmitDraw = () => {
        const nftIndex = nfts.findIndex((n) => n.startX == pickedOwnNFT.startX && n.startY == pickedOwnNFT.startY);
        console.log({updatedNFT: nfts[nftIndex]});
        // TODO: send, and maybe just do a diff?
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
                ownNFTs={[
                    {startX: nft1.startX, startY: nft1.startY, endX: nft1.endX, endY: nft1.endY},
                    {startX: nft2.startX, startY: nft2.startY, endX: nft2.endX, endY: nft2.endY}
                ]}
                outlineMultipleNFTs={outlineMultipleNFTs}
                clearOutlineNFTs={clearOutlineNFTs}
                pickedOwnNFT={pickedOwnNFT}
                onClickDraw={onClickDraw}
                onCancelDraw={onCancelDraw}
                onSubmitDraw={onSubmitDraw}
                onPickColor={pickColor}
            />
            {tooltipVisible && <Tooltip mousePosition={mousePosition} hoveredNFT={hoveredNFT}/>}
        </div>
    );
}