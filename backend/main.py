from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from datetime import date
from typing import Optional
import os, json, httpx, asyncio

app = FastAPI(title="AlertsIQ API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

CSV_PATH = os.path.join(os.path.dirname(__file__), "alerts_data.csv")


def load_df():
    df = pd.read_csv(CSV_PATH)
    df.columns = df.columns.str.lower().str.strip()
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["severity"] = df["severity"].astype(str).str.strip().str.capitalize()
    return df


def apply_filters(df, severities, applications, date_from, date_to):
    if severities:
        df = df[df["severity"].isin(severities)]
    if applications:
        df = df[df["application"].isin(applications)]
    if date_from:
        df = df[df["date"].dt.date >= date_from]
    if date_to:
        df = df[df["date"].dt.date <= date_to]
    return df


@app.get("/api/meta")
def get_meta():
    df = load_df()
    return {
        "severities": sorted(df["severity"].dropna().unique().tolist()),
        "applications": sorted(df["application"].dropna().unique().tolist()),
        "date_min": df["date"].min().date().isoformat(),
        "date_max": df["date"].max().date().isoformat(),
    }


@app.get("/api/kpis")
def get_kpis(
    severities: list[str] = Query(default=[]),
    applications: list[str] = Query(default=[]),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
):
    df = load_df()
    df = apply_filters(df, severities, applications, date_from, date_to)
    total = len(df)
    n_crit = int((df["severity"] == "Critical").sum())
    n_high = int((df["severity"] == "High").sum())
    vc = df["application"].value_counts()
    top_app = vc.idxmax() if total > 0 else "—"
    top_n = int(vc.iloc[0]) if total > 0 else 0
    return {
        "total": total,
        "critical": n_crit,
        "high": n_high,
        "pct_critical": round(n_crit / total * 100) if total else 0,
        "pct_high": round(n_high / total * 100) if total else 0,
        "top_app": top_app,
        "top_n": top_n,
        "n_apps": int(df["application"].nunique()),
    }


@app.get("/api/charts/daily")
def get_daily(
    severities: list[str] = Query(default=[]),
    applications: list[str] = Query(default=[]),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
):
    df = load_df()
    df = apply_filters(df, severities, applications, date_from, date_to)
    daily = df.groupby([df["date"].dt.date, "severity"]).size().reset_index(name="count")
    daily["date"] = daily["date"].astype(str)
    return daily.to_dict(orient="records")


@app.get("/api/charts/severity")
def get_severity_dist(
    severities: list[str] = Query(default=[]),
    applications: list[str] = Query(default=[]),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
):
    df = load_df()
    df = apply_filters(df, severities, applications, date_from, date_to)
    sc = df["severity"].value_counts().reset_index()
    sc.columns = ["severity", "count"]
    return sc.to_dict(orient="records")


@app.get("/api/charts/apps")
def get_apps(
    severities: list[str] = Query(default=[]),
    applications: list[str] = Query(default=[]),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
):
    df = load_df()
    df = apply_filters(df, severities, applications, date_from, date_to)
    ac = df["application"].value_counts().reset_index()
    ac.columns = ["application", "count"]
    return ac.to_dict(orient="records")


@app.get("/api/charts/heatmap")
def get_heatmap(
    severities: list[str] = Query(default=[]),
    applications: list[str] = Query(default=[]),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
):
    df = load_df()
    df = apply_filters(df, severities, applications, date_from, date_to)
    heat = df.groupby(["application", "description"]).size().reset_index(name="count")
    return heat.to_dict(orient="records")


@app.get("/api/charts/severity-app")
def get_severity_per_app(
    severities: list[str] = Query(default=[]),
    applications: list[str] = Query(default=[]),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
):
    df = load_df()
    df = apply_filters(df, severities, applications, date_from, date_to)
    sa = df.groupby(["application", "severity"]).size().reset_index(name="count")
    return sa.to_dict(orient="records")


@app.get("/api/charts/descriptions")
def get_descriptions(
    severities: list[str] = Query(default=[]),
    applications: list[str] = Query(default=[]),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
):
    df = load_df()
    df = apply_filters(df, severities, applications, date_from, date_to)
    dc = df["description"].value_counts().reset_index()
    dc.columns = ["description", "count"]
    return dc.to_dict(orient="records")


@app.get("/api/data")
def get_data(
    severities: list[str] = Query(default=[]),
    applications: list[str] = Query(default=[]),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    search: Optional[str] = None,
):
    df = load_df()
    df = apply_filters(df, severities, applications, date_from, date_to)
    if search:
        mask = df.apply(lambda r: search.lower() in str(r).lower(), axis=1)
        df = df[mask]
    df["date"] = df["date"].dt.strftime("%b %d, %Y")
    return {"rows": df.to_dict(orient="records"), "total": len(df)}


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []
    context: str = ""


GREETINGS = {"hi", "hello", "hey", "hii", "helo", "sup", "yo", "hi there", "hello there", "hey there", "how are you", "how r u", "what's up", "whats up"}

def is_greeting(msg: str) -> bool:
    cleaned = msg.strip().lower().rstrip("!.,?")
    if cleaned in GREETINGS:
        return True
    # Single word that starts with a greeting word
    words = cleaned.split()
    return len(words) <= 3 and words[0] in {"hi", "hello", "hey", "hii", "helo"}

@app.post("/api/chat")
async def chat(req: ChatRequest):
    # Fast greeting shortcut — no model needed
    if is_greeting(req.message):
        return {"reply": "How can I assist you?", "model": "AlertsIQ AI"}

    system = f"""You are an AI analyst in the AlertsIQ dashboard. Only answer questions about the alerts data. Do not volunteer data summaries unless the user specifically asks. Answer in 1-3 short sentences max. No long explanations. No filler. Use exact numbers when available.
{req.context}"""

    messages = []
    for m in req.history[-6:]:
        messages.append({"role": m["role"], "content": m["content"]})
    messages.append({"role": "user", "content": req.message})

    # Try Ollama with mistral
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                "http://localhost:11434/api/chat",
                json={"model": "mistral:latest", "messages": [{"role": "system", "content": system}] + messages, "stream": False},
            )
            print(f"Ollama status: {resp.status_code}, body: {resp.text[:300]}")
            if resp.status_code == 200:
                data = resp.json()
                return {"reply": data["message"]["content"], "model": "mistral:latest · Ollama"}
    except Exception as e:
        print(f"Ollama error: {type(e).__name__}: {e}")

    # Fallback: rule-based response using context
    df = load_df()
    reply_lines = ["⚠️ Ollama not available. Here's a data summary based on your question:\n"]
    q = req.message.lower()
    if "critical" in q:
        n = int((df["severity"] == "Critical").sum())
        apps = df[df["severity"] == "Critical"]["application"].value_counts().head(3)
        reply_lines.append(f"• **{n} Critical alerts** total")
        for app, cnt in apps.items():
            reply_lines.append(f"  - {app}: {cnt} critical alerts")
    elif "high" in q:
        n = int((df["severity"] == "High").sum())
        reply_lines.append(f"• **{n} High severity alerts** total")
    elif "app" in q or "application" in q:
        vc = df["application"].value_counts().head(5)
        reply_lines.append("• **Top applications by alert count:**")
        for app, cnt in vc.items():
            reply_lines.append(f"  - {app}: {cnt} alerts")
    else:
        reply_lines.append(f"• **Total alerts:** {len(df)}")
        reply_lines.append(f"• **Applications monitored:** {df['application'].nunique()}")
        for sev, cnt in df["severity"].value_counts().items():
            reply_lines.append(f"• **{sev}:** {cnt} alerts")
    return {"reply": "\n".join(reply_lines), "model": "fallback · built-in"}