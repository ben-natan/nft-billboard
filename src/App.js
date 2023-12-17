import './App.css';

import { useEffect, useState } from 'react';
import Billboard from './Billboard';

export const contractAddress = '0xd25f859374698ca88409d2e3B3E688FA45d491B2';

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      setCurrentAccount(accounts[0]);
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
