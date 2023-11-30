import { useEffect } from "react";
import { SELECTION_STATES, CELL_WIDTH, CELL_HEIGHT, colors } from "./Billboard";

const BOTTOM_MENU_WIDTH = 300 // px
const BOTTOM_MENU_HEIGHT = 80 // px

export default function BottomMenu(props) {
    const {
        onMouseEnter,
        onMouseLeave,
        selectionState,
        selectionCoords,
        onMint,
        onClearSelection,
        ownNFTs,
        outlineMultipleNFTs,
        clearOutlineNFTs,
        pickedOwnNFT,
        onClickDraw,
        onCancelDraw,
        onSubmitDraw,
    } = props;

    useEffect(() => {
        console.log({colors})
    })

    return (
        <div style={{
            width: BOTTOM_MENU_WIDTH + "px",
            height: BOTTOM_MENU_HEIGHT + "px",
            position: 'fixed',
            backgroundColor: 'lightblue',
            top: '85vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
            }}

            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            >
            {
                selectionState == SELECTION_STATES.None &&
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <p style={{marginBottom: 0}}>Select an area to mint</p>
                    {ownNFTs.length > -1 &&
                        <p>or select&nbsp;
                            <a onMouseEnter={() => outlineMultipleNFTs(ownNFTs)} onMouseLeave={clearOutlineNFTs}
                                style={{textDecoration: 'underline'}}
                            >one of your areas
                            </a> to draw</p>
                    }
                </div>
            }
            {
                selectionState == SELECTION_STATES.PickedOwnNFT &&
                <>
                    <p> Picked NFT: x = {pickedOwnNFT.startX}, y = {pickedOwnNFT.startY} </p>
                    <button onClick={onClickDraw}> Draw! </button>
                </>
            }
            {
                (selectionState == SELECTION_STATES.Selecting || selectionState == SELECTION_STATES.Done) &&  (
                <>
                    <button onClick={onMint}> mint </button>
                    <p>{Math.abs(selectionCoords.width) / CELL_WIDTH} x {Math.abs(selectionCoords.height) / CELL_HEIGHT}</p>
                    <button onClick={onClearSelection}>Clear</button>
                </>
                )
            }
            {
                selectionState == SELECTION_STATES.Drawing &&
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div style={{display: 'grid', gridTemplateColumns: 'auto auto auto auto auto auto auto auto'}}>
                        {colors.map((c, i) => (
                            <div
                                style={{height: '30px', width: '30px', backgroundColor: c}}
                            >1</div>
                        ))}
                        <p>sss</p>
                    </div>
                    <button onClick={onCancelDraw}>Cancel</button>
                    <button onClick={onSubmitDraw}>Submit</button>
                </div>
            }



        </div>
    )
}