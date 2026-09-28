"use client";

import { useMemo, useState } from "react";
import { BarChart3, Search, Users, Send, Plus, ArrowRight, CheckCircle2 } from "lucide-react";

type Lead = {
  id: number; company: string; founder: string; service: string; score: number;
  signal: string; hypothesis: string; status: string;
};

const seed: Lead[] = [
  { id: 1, company: "Northstar Creative", founder: "Aarav Shah", service: "Brand & Web", score: 86, signal: "Team expanding + new service launch", hypothesis: "Delivery cost and utilization may be squeezing margin.", status: "Qualified" },
  { id: 2, company: "GrowthCraft", founder: "Maya Patel", service: "Performance Marketing", score: 78, signal: "Hiring across client delivery", hypothesis: "Client-level profitability may be unclear as headcount grows.", status: "Qualified" },
  { id: 3, company: "Pixel & Co.", founder: "Rohan Mehta", service: "Design Studio", score: 61, signal: "Founder still involved in delivery", hypothesis: "Founder time and project pricing may be creating hidden costs.", status: "Watchlist" }
];

export default function Home() {
  const [leads, setLeads] = useState(seed);
  const [url, setUrl] = useState("");
  const [notice, setNotice] = useState("");

  const stats = useMemo(() => ({
    total: leads.length,
    qualified: leads.filter(l => l.score >= 70).length,
    ready: leads.filter(l => l.score >= 70 && l.status !== "DM Sent").length,
    replies: 0
  }), [leads]);

  function research() {
    if (!url.trim()) return;
    const company = url.replace(/^https?:\/\//, "").split("/")[0].replace("www.", "").split(".")[0];
    const pretty = company ? company.charAt(0).toUpperCase() + company.slice(1) : "New Agency";
    const newLead: Lead = {
      id: Date.now(), company: pretty, founder: "Founder to verify", service: "Agency / Service Business",
      score: 72, signal: "Public company profile added for research", hypothesis: "Potential profitability leakage needs evidence from business data.", status: "New"
    };
    setLeads(prev => [newLead, ...prev]);
    setUrl("");
    setNotice("Lead added. Review the evidence before outreach.");
  }

  function markSent(id: number) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: "DM Sent" } : l));
    setNotice("DM marked as sent. Actual LinkedIn sending stays human-approved.");
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="logo">P</div><div><b>Profitability AI</b><span>Agency growth OS</span></div></div>
        <nav>
          <a className="active"><BarChart3 size={18}/> Dashboard</a>
          <a><Search size={18}/> Find Leads</a>
          <a><Users size={18}/> Qualified Leads</a>
          <a><Send size={18}/> Outreach</a>
        </nav>
        <div className="side-note"><b>V1</b><span>Research → qualify → personalize → track</span></div>
      </aside>

      <section className="content">
        <header className="topbar"><div><h1>Dashboard</h1><p>Find agencies where revenue is growing faster than profit.</p></div><button className="primary" onClick={() => document.getElementById("finder")?.focus()}><Plus size={18}/> Add lead</button></header>

        <div className="stats">
          <Stat label="Leads" value={stats.total} />
          <Stat label="Qualified" value={stats.qualified} />
          <Stat label="DMs ready" value={stats.ready} />
          <Stat label="Replies" value={stats.replies} />
        </div>

        <section className="finder">
          <div><div className="eyebrow">LEAD FINDER</div><h2>Research an agency</h2><p>Paste a company website or public profile URL. V1 creates a lead card for review.</p></div>
          <div className="finder-row"><input id="finder" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://agencywebsite.com" onKeyDown={e => e.key === "Enter" && research()}/><button className="primary" onClick={research}>Research <ArrowRight size={17}/></button></div>
        </section>

        {notice && <div className="notice"><CheckCircle2 size={17}/>{notice}</div>}

        <section className="panel">
          <div className="panel-head"><div><h2>Lead pipeline</h2><p>AI hypotheses are estimates, not verified financial facts.</p></div><span className="pill">{leads.length} leads</span></div>
          <div className="table">
            <div className="row header"><span>Company</span><span>Founder</span><span>Signal</span><span>Score</span><span>Status</span><span></span></div>
            {leads.map(lead => <div className="row" key={lead.id}>
              <span><b>{lead.company}</b><small>{lead.service}</small></span>
              <span>{lead.founder}</span>
              <span><b>{lead.signal}</b><small>{lead.hypothesis}</small></span>
              <span><strong className={lead.score >= 70 ? "score good" : "score"}>{lead.score}</strong></span>
              <span><span className="status">{lead.status}</span></span>
              <span><button className="ghost" onClick={() => markSent(lead.id)}>Mark DM sent</button></span>
            </div>)}
          </div>
        </section>
      </section>
    </main>
  );
}

function Stat({label, value}: {label: string; value: number}) {
  return <div className="stat"><span>{label}</span><strong>{value}</strong></div>;
}
