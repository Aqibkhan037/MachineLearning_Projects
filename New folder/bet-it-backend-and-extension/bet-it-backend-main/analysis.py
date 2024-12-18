import requests

data = requests.get("https://bet-it.apps.kavithigroup.com/api/v2/stats/?t=0&g1=0&g2=0&start_time=2&limit=1000000", headers={"Authorization": "Basic dXNlcjpGb3JkcHVtYTE5Nzg="}).json()["games"]

print("Analysed data:", len(data))

hh = 0
mm = 0

for game in data:
    game["goals"] = [goal["time"] for goal in game["events"] if (goal["type"] == "GOAL")]

for dd in range(1, 30):
    for t1 in range(3, 100):
        for t2 in range(100):
            hit = 0
            miss = 0
            for game in data:
                goals = game["goals"]
                if len(goals) >= 4:
                    diff = goals[3] - goals[2]
                    if (diff < dd) and (t1 <= goals[2] <= t1 + t2):
                        if set(game["scores"]) == {2, 3}:
                            hit += 1
                        else:
                            miss += 1
            if hit:
                if hit > hh:
                    hh = hit
                    print("T:", dd, t1, t2, "Hit:", hit, "Miss:", miss, f"Success rate: {hit / (hit + miss):.2%}")
print("Done")
