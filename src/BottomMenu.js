import { SELECTION_STATES, BOTTOM_MENU_WIDTH, BOTTOM_MENU_HEIGHT, CELL_WIDTH, CELL_HEIGHT } from "./Billboard";

export default function BottomMenu(props) {
    const { onMouseEnter, onMouseLeave, selectionState, selectionCoords, onMint, onClearSelection } = props;

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
                selectionState == SELECTION_STATES.None
                ? <p>Select an area to mint</p>
                : (
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