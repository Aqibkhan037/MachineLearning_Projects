import os
from datetime import datetime

import openpyxl


def make(data: list[dict], filters: list[dict]):
    wb = openpyxl.open("bet_it_template.xlsx")
    ws = wb.active
    active_filters = [f.get("name") or "No Name" for f in filters if f.get("enabled")]
    for i, c in enumerate(ws["R2:AK2"][0]):
        if i == len(active_filters):
            break
        c.value = active_filters[i]
    for r in data:
        row = [
            datetime.fromtimestamp(r["reg_time"]).strftime("%Y-%m-%d"),
            r["title"],
            *r["teams"],
            f"{max(r['scores'])}:{min(r['scores'])}" if r.get("scores") else "",
            *[*[e.get("time") for e in r.get("events", []) if e.get("type") == "GOAL"], *[""] * 12][:12],
        ]
        goals = [u for u in r["events"] if u["type"] == "GOAL"]
        for f in filters:
            if not f.get("enabled"):
                continue
            match = True
            if not (f.get("scorex") and (sorted(r["scores"]) == sorted(f["scorex"]))):
                match = False
            else:
                for g in f.get("goals", []):
                    try:
                        if g.get("start_time") and (g["start_time"] > goals[g["goal"]]["time"]):
                            match = False
                        elif g.get("end_time") and (g["end_time"] < goals[g["goal"]]["time"]):
                            match = False
                        elif g.get("differance") and (g["differance"] < (goals[g["goal"]]["time"] - goals[g["goal"] - 1]["time"])):
                            match = False
                    except Exception:
                        match = False
            row.append("1" if match else "")
        ws.append(row)
    filename = f"Bet It - Report on {datetime.now().strftime('%Y-%m-%d')}.xlsx"
    wb.save(os.path.join("xls", filename))
    return filename
