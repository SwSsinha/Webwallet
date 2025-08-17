import { useState } from "react";
import { mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";

export function SolanaWallet({ mnemonic }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [addresses, setAddresses] = useState([]);
    const [expanded, setExpanded] = useState(true);

    function deriveSolanaKeypair(mn, index) {
        const seed = mnemonicToSeedSync(mn);
        const path = `m/44'/501'/${index}'/0'`;
        const derived = derivePath(path, seed.toString("hex"));
        return Keypair.fromSeed(derived.key);
    }

    function addWallet() {
        if (!mnemonic) return;
        try {
            const keypair = deriveSolanaKeypair(mnemonic, currentIndex);
            const pub = keypair.publicKey.toBase58();
            setCurrentIndex((i) => i + 1);
            setAddresses((prev) => [...prev, pub]);
        } catch (e) {
            // ignore for demo
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
        <div className={`wallet-card card ${expanded ? 'expanded' : 'collapsed'}`}>
            <div className="card-header">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button className="btn primary" onClick={addWallet}>Derive Next SOL Wallet</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="muted" style={{ fontSize: 13 }}>{addresses.length} accounts</div>
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
                        <div className="wallet-index">SOL {index}:</div>
                        <div className="wallet-address-text">{addr}</div>
                        <button className="copy-btn" onClick={() => copyAddress(addr)}>Copy</button>
                    </div>
                ))}
            </div>
        </div>
    );
}