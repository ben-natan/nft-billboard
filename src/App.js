import './App.css';

import { useEffect, useState } from 'react';
import Billboard from './Billboard';

export const contractAddress = '0x177B981fFB17C95da2DFF30709FA9A75A2E793ef';

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Metamask not installed");
    } else {
      console.log("Wallet exists");
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      console.log("Found an account: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  }

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Metamask not installed");
      return;
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Found an account: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.error(err);
    }

  }

  const ConnectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler}>
        Connect Wallet
      </button>
    )
  }



  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  return (
    <>
      {currentAccount ? <Billboard currentAccount={currentAccount} /> : <ConnectWalletButton />}
    </>
  );
}

export default App;
