import React, { useState, useEffect } from 'react'
import './App.css'
import { generateMnemonic } from "bip39";
import { SolanaWallet } from './SolanaWallet';
import { EthWallet } from './EthWallet';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }
  componentDidCatch(error, info) {
    this.setState({ error, info });
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:20, background:'#1b1b1b', color:'#f88', borderRadius:8}}>
          <h3 style={{margin:0}}>An error occurred</h3>
          <div style={{marginTop:8, color:'#ffb3b3', fontFamily:'monospace', whiteSpace:'pre-wrap', maxHeight:320, overflow:'auto'}}>
            {this.state.error && this.state.error.toString()}
            {this.state.info?.componentStack}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [mnemonic, setMnemonic] = useState("");
  const [copied, setCopied] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  useEffect(() => {
    const onErr = (message, source, lineno, colno, err) => {
      console.error("window.onerror", message, err);
      setGlobalError(message || String(err));
    };
    const onRejection = (e) => {
      console.error("unhandledrejection", e);
      setGlobalError(e?.reason ? String(e.reason) : String(e));
    };
    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onErr);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  async function createSeed() {
    const mn = generateMnemonic();
    setMnemonic(mn);
    setCopied(false);
  }

  async function copyToClipboard() {
    if (!mnemonic) return;
    try {
      await navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy to clipboard:", e);
      alert("Could not copy to clipboard. Please try again.");
    }
  }

  return (
    <div className="bw-root">
      <header className="bw-header">
        <h1 className="bw-title">Minimal Wallet</h1>
        <p className="bw-sub">Monochrome seed inspector</p>
      </header>

      {globalError && (
        <div style={{marginBottom:12}}>
          <div style={{padding:10, background:'#2b0000', color:'#ffb3b3', borderRadius:6}}>
            Runtime error detected: {globalError}
          </div>
        </div>
      )}

      <main className="bw-container">
        <div className="controls card">
          <div className="controls-top">
            <button className="btn primary" onClick={createSeed}> Create New Seed Phrase</button>
            <button
              className="btn secondary"
              onClick={() => { setMnemonic(""); setCopied(false); }}
            >
              Clear
            </button>
          </div>

          <label className="label">Seed Phrase</label>
          <textarea
            className="mnemonic"
            value={mnemonic}
            readOnly
            placeholder="Your new seed phrase will appear here..."
          />

          <div className="controls-bottom">
            <button className={`btn ghost ${copied ? 'copied' : ''}`} onClick={copyToClipboard} disabled={!mnemonic}>
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
          </div>
        </div>

        <section className="wallets">
          <ErrorBoundary>
            <div className="wallet-card card">
              <h2>Solana</h2>
              {typeof SolanaWallet !== 'function' ? (
                <div style={{color:'#f66'}}>SolanaWallet missing or failed to load</div>
              ) : (
                (mnemonic ? <SolanaWallet mnemonic={mnemonic} /> : <p className="muted">Generate a seed phrase to view Solana keys.</p>)
              )}
            </div>

            <div className="wallet-card card">
              <h2>Ethereum</h2>
              {typeof EthWallet !== 'function' ? (
                <div style={{color:'#f66'}}>EthWallet missing or failed to load</div>
              ) : (
                (mnemonic ? <EthWallet mnemonic={mnemonic} /> : <p className="muted">Generate a seed phrase to view Ethereum keys.</p>)
              )}
            </div>
          </ErrorBoundary>
        </section>
      </main>

      <footer className="bw-footer">
        <small>Demo only — never use these seeds for real funds.</small>
      </footer>
    </div>
  )
}

export default App
