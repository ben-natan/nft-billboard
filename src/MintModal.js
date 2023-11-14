import contract from './contracts/nft-billboard.json';
import { contractAddress } from "./App";
import { ethers } from 'ethers';

const abi = contract.abi;

export default function MintModal(props) {
    const { cellNumber } = props;

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
        <div style={{display: 'flex', flexDirection: 'column',
                    justifyContent: 'space-around', alignItems: 'center',
                    height: '100%'}}>
            {/* TODO: form to call the mint function */}
            <p>{cellNumber}</p>
            <div>
                <MintButton />
            </div>
        </div>
    )
}