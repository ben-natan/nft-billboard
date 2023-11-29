import { SELECTION_STATES, CELL_WIDTH, CELL_HEIGHT } from "./Billboard";

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
    } = props;

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



        </div>
    )
}