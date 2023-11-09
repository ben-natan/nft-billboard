import { ethers } from "ethers";
import contract from './contracts/nft-billboard.json';


const contractAddress = '';
const abi = contract.abi;

export default function Canvas() {

    // TODO
    const mintHandler = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const billboardContract = new ethers.Contract(contractAddress, abi, signer);

                let txn = await billboardContract.mint(); // TODO

                await txn.wait();

                console.log("Mined transaction: ", txn.hash);
            } else {
                console.error("Ethereum object does not exist");
            }
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div>
          <p>
            The canvas
          </p>
        </div>
    );
}