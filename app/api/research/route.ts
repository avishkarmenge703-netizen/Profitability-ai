import { NextRequest, NextResponse } from "next/server";

function titleFromUrl(raw:string){
  try { const u=new URL(raw.startsWith("http")?raw:"https://"+raw); return u.hostname.replace(/^www\./,"").split(".")[0].replace(/[-_]/g," "); }
  catch { return "New Agency"; }
}

export async function POST(req:NextRequest){
  try{
    const {url=""}=await req.json(); const input=String(url).trim();
    if(!input) return NextResponse.json({error:"URL is required"},{status:400});
    const name=titleFromUrl(input), company=name.split(" ").map(x=>x.charAt(0).toUpperCase()+x.slice(1)).join(" ");
    const lower=input.toLowerCase();
    const fit=/agency|studio|creative|marketing|design|consult|digital|media|growth|brand/.test(lower)?20:12;
    const size=/50|million|crore/.test(lower)?20:10;
    const complexity=/team|services|clients|projects/.test(lower)?12:7;
    const pain=/growth|scale|hire|hiring|pricing|profit|cash/.test(lower)?17:10;
    const reach=15, score=Math.min(100,fit+size+complexity+pain+reach);
    return NextResponse.json({
      company, founder:"Founder to verify", service:fit===20?"Agency / Service Business":"Service business (verify)",
      size:size===20?"Possible ₹50L+ signal from input":"Revenue not verified",
      signals:["Public URL supplied for research","Revenue and founder details require verification"],
      hypothesis:"Possible leakage in client profitability, delivery cost, utilization, pricing, or operating overhead. This is a hypothesis—not a verified fact.",
      evidence:["Input URL: "+input,"No financial data was supplied, so revenue and margin claims are estimates."],
      score,
      breakdown:[
        {label:"ICP fit",points:fit,max:20},{label:"Estimated size",points:size,max:20},
        {label:"Business complexity",points:complexity,max:15},{label:"Pain signal",points:pain,max:20},
        {label:"Reachability",points:reach,max:25}
      ],
      dm:`Hi — I came across ${company}. I’m researching a specific issue with growing service businesses: revenue goes up, but delivery cost, utilization, pricing, or overhead can quietly absorb the extra margin. I had a hypothesis about where that can happen in a business like yours. Open to me sharing the 2–3 patterns I’m seeing?`
    });
  }catch{return NextResponse.json({error:"Invalid request"},{status:400});}
}