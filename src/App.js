import logo from './logo.svg';
import './App.css';

import { useEffect, useState } from 'react';
import Canvas from "./Canvas"


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

  const connectWalletButton = () => {
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
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          {currentAccount ? <Canvas /> : connectWalletButton()}
        </div>
      </header>
    </div>
  );
}

export default App;
