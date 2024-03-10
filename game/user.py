from game.room import Room
from game.sign import Sign
import uuid
from typing import Optional

class User:

    username: str
    peername: tuple
    room: Optional[Room]
    is_catcher: bool = False
    has_flag: bool = False
    is_ready: bool = False
    sign: Optional[int]

    def __init__(self, writer, username, peername):
        self.writer = writer
        self.username = username
        self.peername = peername
        self.uuid = str(uuid.uuid4())
        self.room = None
        self.sign = None

    def get_room_users(self):
        if self.room is None:
            return []
        return self.room.users

    def get_room_uuid(self):
        if self.room is None:
            return None
        return self.room.uuid

    def set_room(self, room: Room):
        self.room = room

    def set_is_catcher(self, is_catcher):
        self.is_catcher = is_catcher

    def set_has_flag(self, has_flag):
        self.has_flag = has_flag

    def set_is_ready(self, is_ready):
        self.is_ready = is_ready

    def set_sign(self, sign):
        self.sign = sign

    def get_broadcast(self):
        return {
            "username": self.username,
            "isReady": self.is_ready,
            "uuid": self.uuid,
            "sign": self.sign
        }

