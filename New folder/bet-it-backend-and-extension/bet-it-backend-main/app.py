import base64
from datetime import datetime

from fastapi import FastAPI, Request
from starlette.middleware.cors import CORSMiddleware

from api import router as api_router

app = FastAPI()


@app.middleware("http")
async def pre_processing(request: Request, call_next):
    t = datetime.now().timestamp()
    request.state.ip = request.headers.get("X-Real-IP")
    request.state.ua = request.headers.get("User-Agent")
    request.state.user = None
    user = request.headers.get("Authorization")
    if user:
        request.state.user = base64.b64decode(user.split(" ")[-1]).split(b":")[0].decode()
    response = await call_next(request)
    response.headers["x-process-time"] = f"{datetime.now().timestamp() - t:0.1f}"
    return response


app.add_middleware(CORSMiddleware,
                   allow_origins=["https://www.bet365.it", "http://localhost:4203", "https://over4fun.it"],
                   allow_credentials=True,
                   allow_methods=["GET", "POST"],
                   allow_headers=["Authorization"]
                   )

app.include_router(api_router)
