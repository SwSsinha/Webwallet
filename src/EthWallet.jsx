import { useState } from "react";
import { Wallet } from "ethers";

export const EthWallet = ({ mnemonic }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(true);

  async function addWallet() {
    if (!mnemonic) return;
    const derivationPath = `m/44'/60'/0'/0/${currentIndex}`;

    try {
      let wallet = null;

      // preferred: Wallet.fromMnemonic (ethers v5/v6 may expose this)
      if (Wallet && typeof Wallet.fromMnemonic === "function") {
        wallet = Wallet.fromMnemonic(mnemonic, derivationPath);
      }
      // fallback: Wallet.fromPhrase (ethers v6 naming)
      else if (Wallet && typeof Wallet.fromPhrase === "function") {
        wallet = Wallet.fromPhrase(mnemonic, derivationPath);
      }

      if (!wallet) {
        throw new Error("No wallet derivation method available in this ethers build.");
      }

      setCurrentIndex((i) => i + 1);
      setAddresses((prev) => [...prev, wallet.address]);
      setError("");
    } catch (e) {
      console.error("Failed to derive ETH wallet:", e);
      setError("Failed to derive ETH wallet — check console or ethers version.");
      setTimeout(() => setError(""), 3500);
    }
  }

  async function copyAddress(addr) {
    try {
      await navigator.clipboard.writeText(addr);
    } catch (e) {
      // ignore
    }
  }

  return (
    <>
      <div className={`wallet-card card ${expanded ? 'expanded' : 'collapsed'}`}>
        <div className="card-header">
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <button className="btn primary" onClick={addWallet}>
              Derive Next ETH Wallet
            </button>
            {error && <div style={{ color: "#ff6b6b", fontSize: 13 }}>{error}</div>}
          </div>

          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <div className="muted" style={{fontSize:13}}>{addresses.length} accounts</div>
            <button
              className="toggle-btn"
              aria-expanded={expanded}
              onClick={() => setExpanded((s) => !s)}
              title={expanded ? 'Collapse' : 'Expand'}
            >
              <span className={`chevron ${expanded ? 'open' : ''}`}>▾</span>
            </button>
          </div>
        </div>

        <div className="wallet-list">
          {addresses.map((addr, index) => (
            <div key={addr} className="wallet-row">
              <div className="wallet-index">ETH {index}:</div>
              <div className="wallet-address-text">{addr}</div>
              <button className="copy-btn" onClick={() => copyAddress(addr)}>Copy</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};