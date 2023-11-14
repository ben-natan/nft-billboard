import contract from './contracts/nft-billboard.json';
import { contractAddress } from "./App";
import { ethers } from 'ethers';
import { useState } from 'react';
import "./Billboard.css"

const NUM_COLS = 30
const NUM_ROWS = 21
const IMAGE_WIDTH = 46 // px
const IMAGE_HEIGHT = 35 // px
const BILLBOARD_PADDING = 30 // px
const TOOLTIP_WIDTH = 200 // px
const TOOLTIP_HEIGHT = 80 // px

const abi = contract.abi;
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
    let left = props.mousePosition.left;
    let top = props.mousePosition.top;

    if (left > BILLBOARD_PADDING +  (NUM_COLS - 8) * IMAGE_WIDTH) {
        left -= 2 * IMAGE_WIDTH;
    }

    if (top > BILLBOARD_PADDING +  (NUM_ROWS - 5) * IMAGE_HEIGHT) {
        top -= 2 * IMAGE_HEIGHT;
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
                />
            </>
    )
}

export default function Billboard() {
    // TODO: fetch cells when rendering the page (useEffect)
    const [cells, setCells] = useState(emptyBillboard);
    const [mousePosition, setMousePosition] = useState({
        left: 0,
        top: 0,
    })

    const handleMouseMove = (ev) => {
        setMousePosition({ left: ev.pageX, top: ev.pageY });
        console.log({ left: mousePosition.left });
        console.log({ top: mousePosition.top})
    }

    // TODO: this is just an example
    const mintHandler = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                // TODO: move this out of func to make it global if needed more than once
                const provider = new ethers.BrowserProvider(ethereum);
                const signer = await provider.getSigner();
                const billboardContract = new ethers.Contract(contractAddress, abi, signer);

                let tx = await billboardContract.mint(); // TODO: implement mint() in the contract

                await tx.wait();

                console.log("Mined transaction: ", tx.hash);
            } else {
                console.error("Ethereum object does not exist");
            }
        } catch (err) {
            console.error(err);
        }
    }

    const MintButton = () => {
        return (
            <button onClick={mintHandler}>
                Mint
            </button>
        )
    }

    return (
        <div className="billboard-container" onMouseMove={(ev)=> handleMouseMove(ev)}>
            <div className="billboard">
                {cells.map((c, i) => <Cell key={i} index={i}/>)}
            </div>
            <Tooltip mousePosition={mousePosition}/>
        </div>
    );
}