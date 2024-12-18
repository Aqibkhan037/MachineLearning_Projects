import contextlib
import json
import os.path
from datetime import datetime

import pymongo
from fastapi import APIRouter
from starlette.requests import Request
from starlette.responses import FileResponse, Response

import config
from api.make_xls import make

router = APIRouter(prefix="/api/v2")

if not os.path.isfile(config.FILTER_FILE):
    open(config.FILTER_FILE, "w").write("[]")

filters = json.loads(open(config.FILTER_FILE).read())
db = pymongo.MongoClient(config.DB)["bet-it"]["stats_v2"]


@router.get("/filters/")
def get_filters():
    return filters


@router.post("/is-admin/")
def is_admin(request: Request):
    return request.state.user == "admin"


@router.post("/update-filters/")
def update_filters(data: list[dict], request: Request):
    if not is_admin(request):
        return
    global filters
    filters = data
    open(config.FILTER_FILE, "w").write(json.dumps(data, indent=2))


@router.post("/stats/update-single-game/")
async def update_single_dame(data: dict):
    t = int(datetime.now().timestamp())
    data["_id"] = data.pop("id")
    data["time"] = data.get("time") or 0
    data["events"] = sorted((data.get("events") or []), key=lambda a: a["time"])
    data["reg_time"] = t
    data["mod_time"] = t
    db.replace_one({"_id": data["_id"]}, data, upsert=True)


@router.get("/stats/")
def view_stats(request: Request, t: int = 0, g1: int = 0, g2: int = 0, p: float = 0, ol: bool = False, start_time: int = 0, end_time: int = 0, limit: int = config.LIMIT, excel=False):
    ct = (datetime.now() - config.SEARCH_AFTER).timestamp()
    f = [{"time": {"$gte": t * 60}}]
    if start_time:
        f.append({"reg_time": {"$gte": start_time}})
    elif not excel:
        f.append({"reg_time": {"$gte": ct}})
    if end_time:
        f.append({"reg_time": {"$lte": end_time}})
    if ol:
        f.append({"mod_time": {"$gte": (datetime.utcnow() - config.LIVE_TIME).timestamp()}})
    if g1 or g2:
        f.append({"$or": [{"scores": [g1, g2]}, {"scores": [g2, g1]}]})
    if p > 0:
        f.append({"probabilities.1": {"$gte": p}})
    elif p < 0:
        f.append({"probabilities.1": {"$lte": -p}})
    data = list(db.find({"$and": f}).sort({"reg_time": -1}).limit(60000 if excel else limit))
    # data.sort(lambda u: 2)
    ct = (datetime.now() - config.LIVE_TIME).timestamp()
    for r in data:
        r["live"] = r["mod_time"] > ct
        for team in range(2):
            with contextlib.suppress(Exception):
                r["scores"][team] = max(r["scores"][team], len([g for g in r["events"] if g["type"] == "GOAL" and g["team"] == team]))
    data.sort(key=lambda a: - a["time"] + (1 if a["live"] else 1e6))
    if excel:
        if not is_admin(request):
            return None
        try:
            filename = make(data, filters)
            return FileResponse(os.path.join("xls", filename), headers={'Content-Disposition': f'attachment; filename="{filename}.xlsx"'})
        except Exception as e:
            return Response("No records found", 200, headers={'Content-Disposition': f'attachment; filename="empty.csv"'})
    else:
        return {
            "games": data,
            "timestamp": watchdog()
        }


@router.get("/stats/watchdog/")
def watchdog():
    return db.aggregate([
        {
            "$group": {
                "_id": None,
                "mod_time": {"$max": "$mod_time"}
            }
        }
    ]).next()["mod_time"]
