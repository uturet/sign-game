import json
from string import ascii_uppercase
from typing import List

from core import send, read_sign
from game.room import Room
from game.user import User
import random


class MsgType:
    LOGIN = 0
    LOGIN_ERROR = 1
    USER_JOIN = 2
    USER_LEFT = 3
    ERROR = 4
    ROOM_CREATED = 5
    ROOM_UPDATED = 6
    ROOM_DELETED = 7
    ROOM_JOINED = 8
    USER_UPDATED = 9
    GAME_STARTED = 10
    GIVE_FLAG = 11
    ACCEPT_FLAG = 12
    CATCH_FLAG = 13
    GAME_ENDED = 14
    USERS_UPDATED = 15


class Action:
    LOGIN = 0
    NEW_ROOM = 1
    CHANGE_ROOM = 2
    READY = 3
    NOT_READY = 4
    GIVE_FLAG = 5
    RECEIVE_FLAG = 6
    HAS_FLAG = 7

class ActionHandler:
    users: List[User]
    rooms: List[Room]
    actions: dict

    def __init__(self):
        self.users = []
        self.rooms = []
        self.actions = {
            1: self.action_create_room,
            2: self.action_change_room,
            3: self.action_user_ready,
            4: self.action_user_not_ready,
            5: self.action_give_flag,
            6: self.action_receive_flag,
            7: self.action_has_flag,
        }
        self.empty_room = Room('')
        self.empty_room.uuid = ''
        self.empty_room.users = self.users

    def add_user(self, user: User):
        self.users.append(user)

    def get_users(self):
        return self.users

    def remove_user(self, writer):
        for i in range(len(self.users)):
            if self.users[i].writer == writer:
                del self.users[i]
                return

    async def handle(self, user, action, data):
        print(user.uuid, action, data)
        await self.actions[action](user, data)

    async def login(self, websocket):
        msg = await websocket.receive_text()
        try:
            payload = json.loads(msg)
            if payload['action'] == Action.LOGIN and len(payload['data']['username']) > 0:
                user = User(websocket, payload['data']['username'], (websocket.client.host, websocket.client.port))
                self.add_user(user)
                print(f'New User: {user.username} on {user.peername}')
                await send(
                    {
                        "self": user.get_broadcast(),
                        "users": [u.get_broadcast() for u in self.users],
                        "rooms": [r.get_broadcast() for r in self.rooms],
                    },
                    websocket,
                    users=[user],
                    send_self=True,
                    mtype=MsgType.LOGIN)
                await send(user.get_broadcast(), websocket, self.users, mtype=MsgType.USER_JOIN)
                return user
            await send("Wrong Credentials", websocket, mtype=MsgType.LOGIN_ERROR)
            await websocket.close()
        except Exception as e:
            print(e)
            await websocket.close()

    async def action_create_room(self, user: User, data):
        name = '#' + ''.join(random.choices(ascii_uppercase, k=10))
        room = Room(name)
        self.rooms.append(room)
        self.remove_user(user.writer)
        room.join(user)

        await send({"users": [user.get_broadcast()], "rooms": [], "room": room.get_broadcast()}, None,
                   users=[user], mtype=MsgType.ROOM_JOINED)
        await send(user.uuid, user.writer, self.users, mtype=MsgType.USER_LEFT)
        await send(room.get_broadcast(), user.writer, self.users, mtype=MsgType.ROOM_CREATED)
        await send(user.get_broadcast(), user.writer, room.users, mtype=MsgType.USER_JOIN)

    async def action_user_ready(self, user: User, data):
        user.is_ready = True
        await send(user.get_broadcast(), user.writer, user.get_room_users(), send_self=True, mtype=MsgType.USER_UPDATED)

        if all([u.is_ready for u in user.get_room_users()]):
            user.room.close()
            await send(user.room.get_broadcast(), None, user.get_room_users(), mtype=MsgType.ROOM_UPDATED)
            user.room.game.shuffle()
            await send([u.get_broadcast() for u in user.get_room_users()], None, user.get_room_users(), mtype=MsgType.USERS_UPDATED)
            await send(user.room.game.get_broadcast(), None, user.get_room_users(), mtype=MsgType.GAME_STARTED)

    async def action_user_not_ready(self, user: User, data):
        user.is_ready = False
        await send(user.get_broadcast(), user.writer, user.get_room_users(), send_self=True, mtype=MsgType.USER_UPDATED)

    async def action_give_flag(self, user, data):
        sign = read_sign(data)
        player = user.room.game.give_flag(sign)
        if player:
            await send(user.get_broadcast(), None, [player], mtype=MsgType.GIVE_FLAG)
        else:
            await send("Wrong sign", None, [user], mtype=MsgType.ERROR)

    async def action_receive_flag(self, user, data):
        sign = read_sign(data)
        player = user.room.game.receive_flag(user, sign)
        if player:
            user.room.game.set_flag(user)
            await send(user.get_broadcast(), None, user.get_room_users(), mtype=MsgType.USER_UPDATED)
            await send(player.get_broadcast(), None, user.get_room_users(), mtype=MsgType.USER_UPDATED)
        else:
            await send("Wrong sign", None, [user], mtype=MsgType.ERROR)

    async def action_has_flag(self, user, data):
        sign = read_sign(data)
        if user.room.game.has_flag(sign):
            await send(None, None, user.get_room_users(), mtype=MsgType.GAME_ENDED)


    def parse_payload(self, data):
        try:
            data = json.loads(data)
            return True, data['action'], data['data']
        except json.decoder.JSONDecodeError:
            return False, None, None

    async def action_change_room(self, user: User, data):
        try:
            old_room = self.empty_room
            new_room = self.empty_room
            for r in self.rooms:
                if r.uuid == data:
                    new_room = r
                if r.uuid == user.get_room_uuid():
                    old_room = r

            join = new_room.join(user)
            leave = old_room.leave(user)
            user.set_room(new_room)
            rooms = []
            if new_room.uuid == '':
                rooms = [r.get_broadcast() for r in self.rooms]

            print(f'{join} {leave} New room {len(new_room.uuid)} {len(new_room.users)} Old room {len(old_room.uuid)} {len(old_room.users)}')

            await send(user.uuid, user.writer, old_room.users, mtype=MsgType.USER_LEFT)
            await send(new_room.get_broadcast(), user.writer, old_room.users, mtype=MsgType.ROOM_UPDATED)
            await send(old_room.get_broadcast(), user.writer, new_room.users, mtype=MsgType.ROOM_UPDATED)
            await send(
                {"users": [u.get_broadcast() for u in new_room.users], "rooms": rooms, "room": new_room.get_broadcast()},
                user.writer, users=[user], send_self=True, mtype=MsgType.ROOM_JOINED)
            await send(user.get_broadcast(), user.writer, new_room.users, mtype=MsgType.USER_JOIN)
        except Exception as e:
            print(1, e)
