import { useState } from 'react';
import Modal from 'react-modal';
import "./Billboard.css"
import MintModal from './MintModal';

const NUM_COLS = 30
const NUM_ROWS = 21
const IMAGE_WIDTH = 46 // px
const IMAGE_HEIGHT = 35 // px
const BILLBOARD_PADDING = 30 // px
const TOOLTIP_WIDTH = 200 // px
const TOOLTIP_HEIGHT = 80 // px

const emptyBillboard = Array.from(Array(630).keys());

const tooltipVisible = (mousePosition) => {
    if (mousePosition.left < BILLBOARD_PADDING || mousePosition.left > BILLBOARD_PADDING +  NUM_COLS * IMAGE_WIDTH) {
        return false;
    }

    if (mousePosition.top < BILLBOARD_PADDING || mousePosition.top > BILLBOARD_PADDING + NUM_ROWS * IMAGE_HEIGHT) {
        return false;
    }

    return true;
}

const getCellNumber = (mousePosition) => {
    const kX = Math.floor((mousePosition.left - BILLBOARD_PADDING) / IMAGE_WIDTH);
    const kY = Math.floor((mousePosition.top - BILLBOARD_PADDING) / IMAGE_HEIGHT);
    return kX + NUM_COLS * kY;
}

function Tooltip(props) {
    let left = props.mousePosition.left + 5;
    let top = props.mousePosition.top + 5;

    if (left > BILLBOARD_PADDING +  (NUM_COLS - 8) * IMAGE_WIDTH) {
        left -= TOOLTIP_WIDTH + 30;
    }

    if (top > BILLBOARD_PADDING +  (NUM_ROWS - 5) * IMAGE_HEIGHT) {
        top -= TOOLTIP_HEIGHT + 30;
    }

    return (
        <div style={{height: TOOLTIP_HEIGHT + "px", width: TOOLTIP_WIDTH + "px", left, top,
                    display: tooltipVisible(props.mousePosition) ? 'flex' : 'none',
                    backgroundColor: '#282c34', position: 'absolute', cursor: 'default',
                    border: "5px ridge rgba(211, 220, 50, .6)",
                    padding: "5px",
                    flexDirection: "column",
                    justifyContent: "start",
                    fontSize: "12px"}}>
            {/* TODO: fetch informations */}
            <p style={{position: 'absolute', top: "-10px", right: "10px", color: "red", fontSize: "16px"}}>#{getCellNumber(props.mousePosition)}</p>
            <p style={{marginTop: "30px", marginBottom: 0, color: 'white'}}>Owner: 0x00000000000000</p>
            <p style={{marginTop: "10px", color: 'white'}}>Last minted for: 0.34 ETH </p>
        </div>
    )
}

function Cell(props) {
    return (<>
                <img src="https://dummyimage.com/800x700/46bfb3/fff&text=adri"
                alt={props.index}
                style={{maxWidth: "100%", border: 0, cursor: 'default'}}
                onClick={
                    () => {
                        console.log("OPENING");
                        props.openMintModal();
                    }}
                />
            </>
    )
}

Modal.setAppElement(document.getElementById('root'));
export default function Billboard() {
    // TODO: fetch cells when rendering the page (useEffect)
    const [cells, setCells] = useState(emptyBillboard);
    const [mousePosition, setMousePosition] = useState({
        left: 0,
        top: 0,
    })
    const [mintModalIsOpen, setIsOpen] = useState(false);
    const [selectedCell, setSelectedCell] = useState(null);

    function openMintModal() {
        setIsOpen(true);
        setSelectedCell(getCellNumber(mousePosition));
    }

    function closeMintModal() {
        setIsOpen(false);
    }

    const handleMouseMove = (ev) => {
        setMousePosition({ left: ev.pageX, top: ev.pageY });
    }

    return (
        <div className="billboard-container" onMouseMove={(ev)=> handleMouseMove(ev)}>
            <div className="billboard" onClick={() => {console.log("OUI")}}>
                {cells.map((c, i) => <Cell key={i} index={i} openMintModal={openMintModal}/>)}
            </div>
            <Tooltip mousePosition={mousePosition} onClick={() => { console.log("TOOLTIP"); openMintModal(); }}/>
            <Modal
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
            </Modal>
        </div>
    );
}