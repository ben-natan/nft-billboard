import { clear } from '@testing-library/user-event/dist/clear';
import { useEffect, useState, useRef } from 'react';
import Modal from 'react-modal';
import "./Billboard.css"
import MintModal from './MintModal';

const SELECTION_STATES = {
    None: "None",
    Selecting: "Selecting",
    Done: "Done",
}

const NUM_COLS = 1300
const NUM_ROWS = 1000
const CELL_WIDTH = 10 // px
const CELL_HEIGHT = 10 // px
const TOOLTIP_WIDTH = 200 // px
const TOOLTIP_HEIGHT = 80 // px

const nft1Arr = new Uint8ClampedArray(110 * 110 * 4);
for (let i = 0; i < nft1Arr.length; i += 4) {
    nft1Arr[i + 0] = 0; // R value
    nft1Arr[i + 1] = 190; // G value
    nft1Arr[i + 2] = 0; // B value
    nft1Arr[i + 3] = 255; // A value
}
const nft1ImageData = new ImageData(nft1Arr, 110)
const nft1 = {
    startX: 0,
    startY: 0,
    endX: 110,
    endY: 110,
    imageData: nft1ImageData,
}

const nft2Arr = new Uint8ClampedArray(400 * 300 * 4);
for (let i = 0; i < nft2Arr.length; i += 4) {
    nft2Arr[i + 0] = 180; // R value
    nft2Arr[i + 1] = 0; // G value
    nft2Arr[i + 2] = 0; // B value
    nft2Arr[i + 3] = 255; // A value
}
const nft2ImageData = new ImageData(nft2Arr, 400, 300)
const nft2 = {
    startX: 300,
    startY: 0,
    endX: 1400,
    endY: 300,
    imageData: nft2ImageData,
}

const nfts = [nft1, nft2]

function Tooltip(props) {
    return (
        <div style={{height: TOOLTIP_HEIGHT + "px", width: TOOLTIP_WIDTH + "px",
                    display: 'flex',
                    backgroundColor: '#282c34', position: 'absolute', cursor: 'default',
                    border: "5px ridge rgba(211, 220, 50, .6)",
                    padding: "5px",
                    flexDirection: "column",
                    justifyContent: "start",
                    fontSize: "12px"}}>
            {/* TODO: fetch informations */}
            <p style={{position: 'absolute', top: "-10px", right: "10px", color: "red", fontSize: "16px"}}>
                #{props.selectedPixel}
            </p>
            <p style={{marginTop: "30px", marginBottom: 0, color: 'white'}}>Owner: 0x00000000000000</p>
            <p style={{marginTop: "10px", color: 'white'}}>Last minted for: 0.34 ETH </p>
        </div>
    )
}

Modal.setAppElement(document.getElementById('root'));
export default function Billboard() {
    const cvRef = useRef(null);
    const cursorRef = useRef(null);

    // TODO: fetch cells when rendering the page (useEffect)
    useEffect(() => {
        drawBillboard();
        drawGrid();
    }, []);

    const [mintModalIsOpen, setIsOpen] = useState(false);
    const [selectionState, setSelectionState] = useState(SELECTION_STATES.None);
    const [selectionCoords, setSelectionCoords] = useState(null);

    function openMintModal() {
        setIsOpen(true);
    }

    function closeMintModal() {
        setIsOpen(false);
    }

    const drawBillboard = () => {
        const c = cvRef.current;
        const ctx = c.getContext("2d");
        for (let i = 0; i < nfts.length; i++) {
            ctx.putImageData(nfts[i].imageData, nfts[i].startX, nfts[i].startY);
        }
    }

    const drawGrid = () => {
        console.log("drawgrid");
        const c = cvRef.current;
        const ctx = c.getContext("2d");
        ctx.beginPath();
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
    }

    const clearCanvas = () => {
        const c = cvRef.current;
        const ctx = c.getContext("2d");

        ctx.clearRect(0, 0, c.width, c.height);
    }

    const updateCursorPosition = (ev) => {
        const canvas = cvRef.current;
        const bounding = canvas.getBoundingClientRect();

        const cursorLeft = canvas.offsetLeft + ev.clientX - bounding.left - (cursorRef.current.offsetWidth / 2);
        const cursorTop = canvas.offsetTop + ev.clientY - bounding.top - (cursorRef.current.offsetHeight / 2);

        cursorRef.current.style.left = Math.floor(cursorLeft / CELL_WIDTH) * CELL_WIDTH + "px";
        cursorRef.current.style.top = Math.floor(cursorTop / CELL_HEIGHT) * CELL_HEIGHT + "px";

        if (selectionState == SELECTION_STATES.Selecting) {
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
        }

    }

    const startSelection = (ev) => {
        setSelectionState(SELECTION_STATES.Selecting);

        const canvas = cvRef.current;
        const bounding = canvas.getBoundingClientRect();

        const x = ev.clientX - bounding.left - (cursorRef.current.offsetWidth / 2);
        const startX = Math.floor(x / CELL_WIDTH) * CELL_WIDTH;

        const y = ev.clientY - bounding.top - (cursorRef.current.offsetHeight / 2);
        const startY = Math.floor(y / CELL_HEIGHT) * CELL_HEIGHT;

        setSelectionCoords({ startX, startY });
    }

    const endSelection = (ev) => {
        setSelectionState(SELECTION_STATES.Done);
    }

    return (
        <div className="billboard-container">
            <canvas id="canvas" ref={cvRef} width={NUM_COLS} height={NUM_ROWS}
                onMouseMove={updateCursorPosition}
                onMouseDown={startSelection}
                onMouseUp={endSelection}
            >
            </canvas>
            <div id="cursor"
                ref={cursorRef}
                onMouseDown={startSelection}
                onMouseUp={endSelection}
            ></div>
            {/* <Tooltip selectedPixel={selectedPixel}/> */}
            {/* <Modal
                isOpen={mintModalIsOpen}
                onRequestClose={closeMintModal}
                contentLabel="Mint Modal"
                style={{content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    width: '50%',
                    height: '50%'
                  }}}
                >
                <MintModal
                    cellNumber={selectedCell}
                />
            </Modal> */}
            {/* {(selectionState == SELECTION_STATES.None) && <button onClick={() => setSelectionState(SELECTION_STATES.SelectFirstCorner)}>Mint an area</button>}
            {(selectionState == SELECTION_STATES.SelectFirstCorner) &&
                <>
                    <p>Select the first corner</p>
                    <button onClick={() => setSelectionState(SELECTION_STATES.None)}>Cancel</button>
                </>
            }
            {(selectionState == SELECTION_STATES.SelectSecondCorner) &&
                <>
                    <p>Select the second corner</p>
                    <button onClick={() => setSelectionState(SELECTION_STATES.None)}>Cancel</button>
                </>
            } */}
        </div>
    );
}