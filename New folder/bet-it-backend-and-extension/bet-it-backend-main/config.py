from datetime import timedelta

DEBUG = True

DB = "mongodb://localhost:27017"
SEARCH_AFTER = timedelta(hours=23)
LIMIT = 100
MIN_TIME = 3 * 60
LIVE_TIME = timedelta(minutes=10)

FILTER_FILE = "filters.json"