import time
import winsound
from datetime import datetime, timedelta

import requests

session = requests.Session()
session.headers['Authorization'] = 'Basic dXNlcjpGbTI0bnpmcTZTM1RIeEM5'
URL = "https://bet-it.apps.kavithigroup.com/api/v1/stats/"


def notify():
    for i in range(30):
        winsound.Beep(440, 1000)
        time.sleep(1)


while True:
    try:
        response = session.get(URL, timeout=10)
        t = response.json()["timestamp"]
        if datetime.now().timestamp() - t < timedelta(minutes=10).total_seconds():
            print(f"""All Good at {datetime.now()}. Last updated: {datetime.fromtimestamp(t)}""")
        else:
            print(f"ERROR!!! at {datetime.now()}. Last updated: {datetime.fromtimestamp(t)}")
            notify()
    except Exception as e:
        print(f"An error occurred: {e}")
        notify()
    finally:
        time.sleep(240)
