import { useEffect } from "react";
import { SELECTION_STATES, CELL_WIDTH, CELL_HEIGHT, colors } from "./Billboard";

const BOTTOM_MENU_WIDTH = 270 // px
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
        onPickColor,
    } = props;

    useEffect(() => {
        // console.log({ownNFTs})
        console.log({ ownNFTs })
    }, [ownNFTs])

    return (
        <div style={{
            height: BOTTOM_MENU_HEIGHT + 'px',
            width: BOTTOM_MENU_WIDTH + 'px',
            position: 'fixed',
            backgroundColor: '#282c34',
            top: '85vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: 'white',
            padding: '12px',
            alignItems: 'center',
            justifyContent: 'center'
            }}

            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            >
            {
                selectionState == SELECTION_STATES.None &&

                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.5, cursor: 'default'}}>
                    <p style={{margin: 0, fontWeight: 'bold'}}>Select an area to mint</p>
                    {ownNFTs.length > -1 &&
                        <p style={{margin: 0}}>or select&nbsp;
                            <a onMouseEnter={() => outlineMultipleNFTs(ownNFTs)} onMouseLeave={clearOutlineNFTs}
                                style={{color: 'lightblue'}}
                            >one of your areas
                            </a> to draw</p>
                    }
                </div>
            }
            {
                selectionState == SELECTION_STATES.PickedOwnNFT &&
                <>
                    <p> Picked NFT: x = {pickedOwnNFT.startX}, y = {pickedOwnNFT.startY}</p>
                    <button onClick={onClickDraw} style={{
                        background: 'lightblue',
                        border: 'none',
                        width: '60px',
                        height: '30px',
                        cursor: 'pointer'
                    }}> Draw! </button>
                </>
            }
            {
                (selectionState == SELECTION_STATES.Selecting || selectionState == SELECTION_STATES.Done) &&  (
                <>
                    <button onClick={onMint} style={{
                            background: 'lightgreen',
                            border: 'none',
                            width: '60px',
                            height: '30px',
                            cursor: 'pointer'
                        }}>Mint</button>
                    <p style={{margin: '5px'}}>{Math.abs(selectionCoords.width) / CELL_WIDTH} x {Math.abs(selectionCoords.height) / CELL_HEIGHT}</p>
                    <button onClick={onClearSelection} style={{
                            background: '#FFCCCB',
                            border: 'none',
                            width: '60px',
                            height: '30px',
                            cursor: 'pointer'
                        }}>Clear</button>
                </>
                )
            }
            {
                selectionState == SELECTION_STATES.Drawing &&
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div style={{display: 'grid', cursor: 'pointer', gridTemplateColumns: 'auto auto auto auto auto auto auto auto'}}>
                        {colors.map((c, i) => (
                            <div
                                key={i}
                                style={{height: '30px', width: '30px', backgroundColor: c}}
                                onClick={() => onPickColor(i)}
                            ></div>
                        ))}
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                        <button onClick={onCancelDraw} style={{
                            background: '#FFCCCB',
                            border: 'none',
                            width: '60px',
                            height: '25px',
                            cursor: 'pointer',
                        }}>Cancel</button>
                        <button onClick={onSubmitDraw} style={{
                            background: 'lightgreen',
                            border: 'none',
                            width: '60px',
                            height: '25px',
                            cursor: 'pointer'
                        }}>Submit</button>
                    </div>
                </div>
            }



        </div>
    )
}