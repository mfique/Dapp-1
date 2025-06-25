import React, { useState, useEffect, useRef } from "react";
import Web3 from "web3";
import HelloWorldContract from "./HelloWorld.json";
import "./App.css";

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [storedName, setStoredName] = useState("");
  const [newName, setNewName] = useState("");
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' | 'error'
  const [highlight, setHighlight] = useState(false);
  const timeoutRef = useRef();

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          setWeb3(web3Instance);
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = HelloWorldContract.networks[networkId];

          if (deployedNetwork) {
            const contractInstance = new web3Instance.eth.Contract(
              HelloWorldContract.abi,
              deployedNetwork.address
            );
            setContract(contractInstance);
          } else {
            console.error("Contract not deployed on the detected network.");
          }
        } catch (error) {
          console.error("Error connecting to MetaMask or getting account information:", error);
        }
      } else {
        console.error("MetaMask not detected.");
      }
    };

    initWeb3();
  }, []);

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setMessage(""), 3000);
  };

  const handleSetName = async () => {
    if (!contract || !account) return;
    setLoading(true);
    try {
      await contract.methods.setName(newName).send({ from: account, gas: 3000000 });
      setNewName("");
      showMessage("Name set successfully!", "success");
    } catch (error) {
      showMessage("Error setting name", "error");
    }
    setLoading(false);
  };

  const handleGetName = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const name = await contract.methods.getName().call();
      setStoredName(name);
      setHighlight(true);
      showMessage("Name retrieved!", "success");
      setTimeout(() => setHighlight(false), 1200);
    } catch (error) {
      showMessage("Error getting name", "error");
    }
    setLoading(false);
  };

  const handleInputChange = (event) => {
    setNewName(event.target.value);
  };

  return (
    <div className="app-bg">
      <div className="card form-card fade-in">
        <div className="emoji-header" aria-label="wave">Hello World and Name Dapp👋</div>
        {message && (
          <div className={`feedback-message ${messageType}`}>{message}</div>
        )}
        <form
          onSubmit={e => { e.preventDefault(); handleSetName(); }}
          className="name-form"
        >
          <label htmlFor="name-input" className="form-label">Enter your name:</label>
          <input
            id="name-input"
            type="text"
            value={newName}
            onChange={handleInputChange}
            placeholder="e.g. Alice"
            className="input-modern"
            autoComplete="off"
            disabled={loading}
            style={{ boxSizing: 'border-box', maxWidth: '100%' }}
          />
          <div className="button-group">
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? <span className="spinner"></span> : "Set Name"}
            </button>
            <button className="btn-secondary" type="button" onClick={handleGetName} disabled={loading}>
              {loading ? <span className="spinner"></span> : "Get Name"}
            </button>
          </div>
        </form>
        <div className="output-section">
          <label className="form-label">Stored name:</label>
          <input
            type="text"
            value={storedName}
            readOnly
            placeholder="No name set yet"
            className={`input-modern output${highlight ? " highlight" : ""}`}
            style={{ boxSizing: 'border-box', maxWidth: '100%' }}
          />
        </div>
        <div className="account-info">
          {account && <span>Connected as: <b>{account.slice(0, 6)}...{account.slice(-4)}</b></span>}
        </div>
      </div>
      <footer className="footer">
        <span>Powered by React, Ethereum &amp; Truffle</span>
      </footer>
    </div>
  );
}

export default App;