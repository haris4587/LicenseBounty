import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import "./styles.css";

const CONTRACT_ADDRESS = import.meta.env.VITE_LICENSE_BOUNTY_ADDRESS || "0xe1490cE6FC7Cb0E5946546d4a189273187f58c37";
const EXPLORER = "https://explorer-studio.genlayer.com";
const ZERO = CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000";
const NETWORK = { chainId: "0xf21f", chainName: "GenLayer Studio", nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 }, rpcUrls: ["https://studio.genlayer.com/api"] };

function short(value = "") { return value ? `${value.slice(0, 6)}…${value.slice(-4)}` : "—"; }
function parseJson(value, fallback = null) { try { return JSON.parse(String(value || "")); } catch { return fallback; } }
function formatDate(unix) { return unix ? new Date(Number(unix) * 1000).toLocaleString() : "—"; }

function App() {
  const [wallet, setWallet] = useState("");
  const [network, setNetwork] = useState("");
  const [client, setClient] = useState(null);
  const [ids, setIds] = useState([]);
  const [selected, setSelected] = useState(null);
  const [totals, setTotals] = useState({});
  const [busy, setBusy] = useState("");
  const [tx, setTx] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("explore");
  const [form, setForm] = useState({ bountyId: "license-demo-005", title: "Open-source API bounty", developer: "", requirements: "Use an allowed permissive license, include attribution, and avoid prohibited dependency licenses.", allowed: "MIT\nApache-2.0\nBSD-3-Clause", prohibited: "GPL-3.0\nAGPL-3.0", attribution: true, copyleft: false, deadline: "", grace: "3600", challenge: "300", partial: "70", amount: "1" });
  const [submission, setSubmission] = useState({ bountyId: "license-demo-005", repo: "https://github.com/", commit: "", dependencyEvidence: "", attestation: "I confirm this exact commit is the work submitted for the bounty and the license information is complete." });

  const requireWallet = () => { if (!wallet || !client) throw new Error("Connect MetaMask to GenLayer Studio first."); if (ZERO) throw new Error("The contract address is not configured yet."); return client; };

  async function connectWallet() {
    setBusy("connect"); setError("");
    try {
      const ethereum = window.ethereum;
      if (!ethereum) throw new Error("Install MetaMask to continue.");
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (!accounts?.[0]) throw new Error("No wallet account was selected.");
      const address = accounts[0];
      const c = createClient({ chain: studionet, account: address });
      await c.connect("studionet");
      const chainId = await ethereum.request({ method: "eth_chainId" });
      setWallet(address); setClient(c); setNetwork(chainId);
      if (chainId !== NETWORK.chainId) setError("MetaMask is connected, but the active network is not GenLayer Studio.");
    } catch (e) { setError(e?.message || "Wallet connection failed."); }
    finally { setBusy(""); }
  }

  async function switchNetwork() {
    setBusy("network"); setError("");
    try {
      if (!window.ethereum) throw new Error("Install MetaMask to continue.");
      try { await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: NETWORK.chainId }] }); }
      catch (e) { if (e?.code !== 4902) throw e; await window.ethereum.request({ method: "wallet_addEthereumChain", params: [NETWORK] }); }
      setNetwork(NETWORK.chainId); if (wallet) setClient(createClient({ chain: studionet, account: wallet }));
    } catch (e) { setError(e?.message || "Network switch failed."); }
    finally { setBusy(""); }
  }

  async function read(method, args = []) { const c = requireWallet(); return c.readContract({ address: CONTRACT_ADDRESS, functionName: method, args }); }
  async function write(method, args, value = BigInt(0)) {
    const c = requireWallet(); setBusy(method); setError("");
    try { const hash = await c.writeContract({ address: CONTRACT_ADDRESS, functionName: method, args, value }); setTx(hash); return hash; }
    catch (e) { setError(e?.message || `${method} failed.`); throw e; }
    finally { setBusy(""); }
  }

  async function refresh() {
    if (!client || ZERO) return;
    setBusy("refresh"); setError("");
    try {
      const recent = await read("get_recent_bounty_ids");
      const list = Array.isArray(recent) ? recent : [];
      setIds(list);
      const total = parseJson(await read("get_totals"), {}); setTotals(total || {});
      if (selected?.bounty_id) await loadBounty(selected.bounty_id);
    } catch (e) { setError(e?.message || "Could not read contract state."); }
    finally { setBusy(""); }
  }
  async function loadBounty(id) {
    if (!id) return; setBusy(`read:${id}`); setError("");
    try { const b = parseJson(await read("get_bounty", [id])); if (!b?.bounty_id) throw new Error("No bounty found."); setSelected(b); }
    catch (e) { setError(e?.message || "Could not load bounty."); }
    finally { setBusy(""); }
  }
  useEffect(() => { if (client && !ZERO) refresh(); }, [client]);
  useEffect(() => {
    const ethereum = window.ethereum; if (!ethereum) return undefined;
    const accounts = (a) => { if (!a?.[0]) { setWallet(""); setClient(null); } else setWallet(a[0]); };
    const chain = (c) => { setNetwork(c); setError(c === NETWORK.chainId ? "" : "Switch MetaMask to GenLayer Studio."); };
    ethereum.on?.("accountsChanged", accounts); ethereum.on?.("chainChanged", chain);
    return () => { ethereum.removeListener?.("accountsChanged", accounts); ethereum.removeListener?.("chainChanged", chain); };
  }, []);

  async function createBounty(e) {
    e.preventDefault();
    const deadline = Math.floor(new Date(form.deadline).getTime() / 1000);
    if (!Number.isFinite(deadline)) return setError("Choose a valid future deadline.");
    try { await write("create_bounty", [form.bountyId, form.title, form.developer, form.requirements, form.allowed, form.prohibited, form.attribution, form.copyleft, deadline, Number(form.grace), Number(form.challenge), Number(form.partial) * 100], BigInt(Math.round(Number(form.amount) * 1e18))); setTab("explore"); }
    catch {}
  }
  async function submitRepo(e) {
    e.preventDefault();
    try { await write("submit_repository", [submission.bountyId, submission.repo, submission.commit, submission.dependencyEvidence, submission.attestation]); }
    catch {}
  }

  const status = selected?.status || "NO BOUNTY SELECTED";
  return <div className="shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">LB</span><div><strong>LicenseBounty</strong><small>license-aware open-source escrow</small></div></div><div className="network"><span className={network === NETWORK.chainId ? "dot ok" : "dot"}></span>{network === NETWORK.chainId ? "GenLayer Studio" : "Network not verified"}</div><button className="wallet" onClick={connectWallet} disabled={busy === "connect"}>{wallet ? short(wallet) : "Connect MetaMask"}</button></header>
    {!wallet && <section className="connect-banner"><div><p className="eyebrow">WALLET REQUIRED</p><h1>Make software bounties accountable.</h1><p>LicenseBounty uses GenLayer consensus to inspect a pinned GitHub commit against human-written licensing rules before releasing GEN.</p></div><button className="primary" onClick={connectWallet}>Connect MetaMask to continue</button></section>}
    {wallet && network !== NETWORK.chainId && <div className="notice warning">MetaMask is connected on another network. <button onClick={switchNetwork} disabled={busy === "network"}>Switch to GenLayer Studio</button></div>}
    {error && <div className="notice error">{error}</div>}
    {tx && <div className="notice tx">Transaction submitted: <a href={`${EXPLORER}/tx/${tx}`} target="_blank" rel="noreferrer">{short(tx)}</a><button onClick={() => setTx("")}>Dismiss</button></div>}
    <main className={!wallet ? "locked" : ""}>
      <section className="hero"><div><p className="eyebrow">EVIDENCE-FIRST SETTLEMENT</p><h2>Code compliance, resolved onchain.</h2><p>Pin a repository to an exact commit. Let validators interpret licenses, dependencies, attribution, and prohibited terms. Settle only after a bounded challenge window.</p></div><div className="hero-card"><span>CONTRACT</span><code>{ZERO ? "Not deployed" : short(CONTRACT_ADDRESS)}</code><a href="https://github.com/haris4587/LicenseBounty" target="_blank" rel="noreferrer">View source ↗</a></div></section>
      <section className="stats"><Stat label="Bounties" value={totals.bounties || "0"}/><Stat label="Reviews" value={totals.evaluations || "0"}/><Stat label="Challenges" value={totals.challenges || "0"}/><Stat label="Locked GEN" value={totals.locked_wei ? `${(Number(totals.locked_wei) / 1e18).toFixed(4)}` : "0"}/></section>
      <nav className="tabs"><button className={tab === "explore" ? "active" : ""} onClick={() => setTab("explore")}>Explorer</button><button className={tab === "create" ? "active" : ""} onClick={() => setTab("create")}>Create bounty</button><button className={tab === "submit" ? "active" : ""} onClick={() => setTab("submit")}>Submit repository</button></nav>
      {tab === "explore" && <div className="grid"><section className="panel"><div className="panel-head"><div><p className="eyebrow">ONCHAIN INDEX</p><h3>Recent bounties</h3></div><button className="ghost" onClick={refresh} disabled={!wallet || busy === "refresh"}>Refresh</button></div>{ids.length ? <div className="id-list">{ids.slice().reverse().map(id => <button key={id} onClick={() => loadBounty(id)} className={selected?.bounty_id === id ? "id-row selected" : "id-row"}><span>{id}</span><b>Open detail →</b></button>)}</div> : <Empty text={ZERO ? "Deploy the contract to load live bounties." : "No bounties found on this contract yet."}/>}</section><section className="panel detail">{selected ? <Detail bounty={selected} onAction={async (m, extra = []) => { try { await write(m, [selected.bounty_id, ...extra]); } catch {} }} /> : <Empty text="Select a bounty to inspect its immutable rules, evidence, verdict, and escrow."/>}</section></div>}
      {tab === "create" && <form className="form panel" onSubmit={createBounty}><div className="panel-head"><div><p className="eyebrow">SPONSOR FLOW</p><h3>Create a locked bounty</h3></div><span className="chip amber">GEN ESCROW</span></div><div className="form-grid"><Field label="Bounty ID"><input value={form.bountyId} onChange={e => setForm({...form, bountyId:e.target.value})}/></Field><Field label="Developer wallet"><input placeholder="0x…" value={form.developer} onChange={e => setForm({...form, developer:e.target.value})}/></Field><Field label="Title"><input value={form.title} onChange={e => setForm({...form, title:e.target.value})}/></Field><Field label="GEN deposit"><input type="number" min="0.000001" step="0.000001" value={form.amount} onChange={e => setForm({...form, amount:e.target.value})}/></Field><Field wide label="Requirements"><textarea value={form.requirements} onChange={e => setForm({...form, requirements:e.target.value})}/></Field><Field label="Allowed licenses"><textarea value={form.allowed} onChange={e => setForm({...form, allowed:e.target.value})}/></Field><Field label="Prohibited licenses"><textarea value={form.prohibited} onChange={e => setForm({...form, prohibited:e.target.value})}/></Field><Field label="Submission deadline"><input type="datetime-local" value={form.deadline} onChange={e => setForm({...form, deadline:e.target.value})}/></Field><Field label="Challenge window (sec)"><input type="number" min="300" value={form.challenge} onChange={e => setForm({...form, challenge:e.target.value})}/></Field><Field label="Review grace (sec)"><input type="number" min="600" value={form.grace} onChange={e => setForm({...form, grace:e.target.value})}/></Field><Field label="Partial payout (%)"><input type="number" min="0" max="100" value={form.partial} onChange={e => setForm({...form, partial:e.target.value})}/></Field></div><label className="check"><input type="checkbox" checked={form.attribution} onChange={e => setForm({...form, attribution:e.target.checked})}/> Require attribution evidence</label><label className="check"><input type="checkbox" checked={form.copyleft} onChange={e => setForm({...form, copyleft:e.target.checked})}/> Allow copyleft dependencies</label><button className="primary" disabled={!wallet || network !== NETWORK.chainId || busy === "create_bounty"}>{busy === "create_bounty" ? "Waiting for consensus…" : "Lock GEN and create bounty"}</button></form>}
      {tab === "submit" && <form className="form panel" onSubmit={submitRepo}><div className="panel-head"><div><p className="eyebrow">DEVELOPER FLOW</p><h3>Submit an exact repository version</h3></div><span className="chip mint">COMMIT PINNED</span></div><div className="form-grid"><Field label="Bounty ID"><input value={submission.bountyId} onChange={e => setSubmission({...submission, bountyId:e.target.value})}/></Field><Field label="GitHub repository URL"><input value={submission.repo} onChange={e => setSubmission({...submission, repo:e.target.value})}/></Field><Field wide label="Full commit SHA (40 lowercase hex characters)"><input className="mono" value={submission.commit} onChange={e => setSubmission({...submission, commit:e.target.value})}/></Field><Field wide label="Optional dependency evidence URLs (one per line)"><textarea className="mono" value={submission.dependencyEvidence} onChange={e => setSubmission({...submission, dependencyEvidence:e.target.value})}/></Field><Field wide label="Developer attestation"><textarea value={submission.attestation} onChange={e => setSubmission({...submission, attestation:e.target.value})}/></Field></div><button className="primary" disabled={!wallet || network !== NETWORK.chainId || busy === "submit_repository"}>{busy === "submit_repository" ? "Submitting…" : "Submit repository"}</button></form>}
    </main><footer><span>LicenseBounty · public-evidence prototype · not legal advice</span><span>GenLayer Studio · chain 61999 · <a href="https://github.com/haris4587/LicenseBounty" target="_blank" rel="noreferrer">GitHub</a></span></footer>
  </div>;
}

function Stat({ label, value }) { return <div className="stat"><span>{label}</span><b>{value}</b></div>; }
function Field({ label, children, wide }) { return <label className={wide ? "field wide" : "field"}><span>{label}</span>{children}</label>; }
function Empty({ text }) { return <div className="empty"><div className="empty-icon">⌁</div><p>{text}</p></div>; }
function Detail({ bounty, onAction }) { const latest = bounty.current_evaluation_version ? "Evaluation recorded" : "Awaiting evaluation"; return <div><div className="panel-head"><div><p className="eyebrow">BOUNTY DETAIL</p><h3>{bounty.title}</h3><code>{bounty.bounty_id}</code></div><span className={`chip ${bounty.status === "SETTLED" ? "mint" : "amber"}`}>{bounty.status}</span></div><div className="detail-block"><span>Current verdict</span><strong>{bounty.current_verdict || "—"}</strong><small>{latest} · score {bounty.current_score ?? "—"}</small></div><div className="timeline"><Line label="Rules locked" value={short(bounty.terms_hash)} /><Line label="Developer accepted" value={bounty.developer_accepted ? "YES" : "WAITING"} /><Line label="Escrow remaining" value={`${bounty.escrow_remaining_wei || "0"} wei`} /><Line label="Submission deadline" value={formatDate(bounty.submission_deadline_unix)} /></div><div className="actions"><button className="ghost" onClick={() => onAction("accept_bounty", [bounty.terms_hash])}>Accept terms</button><button className="ghost" onClick={() => onAction("evaluate_compliance")}>Evaluate compliance</button><button className="primary small" onClick={() => onAction("settle_bounty")}>Settle bounty</button></div><p className="hint">The contract, not this interface, decides authorization, timing, consensus, and payout eligibility.</p></div>; }
function Line({ label, value }) { return <div className="line"><span>{label}</span><code>{value}</code></div>; }

createRoot(document.getElementById("root")).render(<App />);
