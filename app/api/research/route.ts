import { NextRequest, NextResponse } from "next/server";

type Page = { url: string; title: string; text: string };

const paths = ["", "/about", "/team", "/services", "/work", "/case-studies", "/careers", "/contact"];

function clean(html: string) {
  return html
    .replace(/<script[\\s\\S]*?<\\/script>/gi, " ")
    .replace(/<style[\\s\\S]*?<\\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\\s+/g, " ")
    .trim();
}

async function getPage(url: string): Promise<Page | null> {
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "ProfitabilityAI-ResearchBot/1.0" },
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) return null;
    const html = (await response.text()).slice(0, 500000);
    const title = html.match(/<title[^>]*>([\\s\\S]*?)<\\/title>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() || "";
    return { url, title, text: clean(html).slice(0, 30000) };
  } catch {
    return null;
  }
}

async function siteResearch(rawUrl: string) {
  const root = new URL(rawUrl.startsWith("http") ? rawUrl : "https://" + rawUrl);
  const pages: Page[] = [];
  for (const path of paths) {
    const page = await getPage(new URL(path, root).href);
    if (page && page.text.length > 80) pages.push(page);
    if (pages.length >= 5) break;
  }
  return { root: root.href, pages };
}

function analyze(data: { root: string; pages: Page[] }) {
  const text = data.pages.map((p) => p.text).join(" ");
  const lower = text.toLowerCase();
  const agency = /(agency|studio|creative|marketing|design|consulting|digital|media|branding|performance)/.test(lower);
  const team = /(team|employees|hiring|careers|join our team)/.test(lower);
  const growth = /(growth|growing|scale|scaling|hiring|expanded|launch|new service|clients)/.test(lower);
  const pain = /(profit|margin|pricing|utilization|utilisation|capacity|cash flow|delivery cost|overhead)/.test(lower);
  const company = data.pages[0]?.title?.split(/[|—-]/)[0]?.trim() || new URL(data.root).hostname.replace(/^www\\./, "");
  const score = (agency ? 20 : 8) + (team ? 12 : 5) + (growth ? 14 : 4) + (pain ? 15 : 5) + (data.pages.length > 1 ? 10 : 4);

  return {
    company,
    founder: "Founder not verified",
    service: agency ? "Agency / service business" : "Service business - verify",
    revenueEstimate: "Unknown - no public revenue evidence found",
    teamSignal: team ? "Team/hiring language found" : "Team size not verified",
    growthSignals: growth ? ["Growth, hiring, expansion, or client activity language found"] : [],
    painSignals: pain ? ["Public profitability, pricing, capacity, or cost language found"] : [],
    hypothesis: "Potential leakage could be in client profitability, delivery cost, utilization, pricing, or operating overhead. Hypothesis only.",
    evidence: data.pages.map((p) => ({ label: p.title || p.url, url: p.url, note: p.text.slice(0, 280) })),
    score,
    breakdown: [
      { label: "ICP fit", points: agency ? 20 : 8, max: 20 },
      { label: "Estimated size", points: 0, max: 20 },
      { label: "Business complexity", points: team ? 12 : 5, max: 15 },
      { label: "Profitability pain", points: pain ? 15 : 5, max: 20 },
      { label: "Reachability / evidence", points: data.pages.length > 1 ? 10 : 4, max: 25 }
    ],
    dm: "Hi - I came across " + company + ". I am researching a specific issue with growing service businesses: revenue can grow while delivery cost, utilization, pricing, or overhead quietly absorbs the extra margin. I had a hypothesis about where that can happen in a business like yours. Open to me sharing the 2-3 patterns I am seeing?"
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = String(body?.url || "").trim();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    const data = await siteResearch(url);
    if (!data.pages.length) {
      return NextResponse.json({ error: "Could not access that public website." }, { status: 422 });
    }

    return NextResponse.json({
      ...analyze(data),
      aiPowered: false,
      sources: data.pages.map((p) => p.url),
      warning: "Website research is active. Live AI web research will be connected next."
    });
  } catch {
    return NextResponse.json({ error: "Research failed. Check the URL and try again." }, { status: 500 });
  }
}
