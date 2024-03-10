from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketDisconnect

from action_handler import ActionHandler, MsgType
from game.game import Game
from game.room import Room
from game.user import User
from core import send


app = FastAPI()
action_handler = ActionHandler()


@app.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    user = await action_handler.login(websocket)
    while True:
        try:
            msg = await websocket.receive_text()
            valid, action, data = action_handler.parse_payload(msg)
            if not valid:
                await send("Invalid Data Format!", websocket, mtype=MsgType.ERROR)
                continue
            await action_handler.handle(user, action, data)
        except Exception as e:
            action_handler.remove_user(user)


