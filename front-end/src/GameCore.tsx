import React, {useState} from 'react'
import useWebSocket from 'react-use-websocket';
import Room from './Room';
import Home from './Home';
import { GameCoreProps, GameType, RoomType, UserType } from './types';
import Game from './Game';

const WS_URL = 'ws://localhost:8000';

// Response Message Type
const T_LOGIN = 0
const T_LOGIN_ERROR = 1
const T_USER_JOIN = 2
const T_USER_LEFT = 3
const T_ERROR = 4
const T_ROOM_CREATED = 5
const T_ROOM_UPDATED = 6
const T_ROOM_DELETED = 7
const T_ROOM_JOINED = 8
const T_USER_UPDATED = 9
const T_GAME_STARTED = 10
const T_GIVE_FLAG = 11
const T_ACCEPT_FLAG = 12
const T_CATCH_FLAG = 13
const T_GAME_ENDED = 14
const T_USERS_UPDATED = 15

// Request Action
const A_LOGIN = 0
const A_NEW_ROOM = 1
const A_CHANGE_ROOM = 2
const A_READY = 3
const A_NOT_READY = 4
const A_GIVE_FLAG = 5
const A_RECEIVE_FLAG = 6
const A_HAS_FLAG = 7

export default function GameCore({username, setUserName}: GameCoreProps) {
    const { sendJsonMessage, lastMessage, readyState } = useWebSocket(WS_URL, {
        onOpen: () => {
            sendJsonMessage({action:A_LOGIN, data:{username:username}})
        },
        onMessage: (e: { data: string; }) => {
            const data = JSON.parse(e.data)
            if (data.type === T_LOGIN) {
                setSelf(data.message.self)
                setUsers(data.message.users)
                setRooms(data.message.rooms)
            } else if (data.type === T_LOGIN_ERROR) {
                setUserName('')
            } else if (data.type === T_USER_JOIN) {
                setUsers((prev) => [...prev, data.message])
            } else if (data.type === T_USER_LEFT) {
                setUsers(prev => prev.filter(u => u.uuid !== data.message))
            } else if (data.type === T_ERROR) {
                console.log(data.message)
            } else if (data.type === T_ROOM_CREATED) {
                setRooms((prev) => [...prev, data.message])
            } else if (data.type === T_ROOM_UPDATED) {
                setRooms((prev) => {
                    const newRooms: RoomType[] = []
                    prev.forEach((r) => {
                        if (r.uuid === data.message.uuid) {
                            newRooms.push(data.message)
                        } else {
                            newRooms.push(r)
                        }
                    })
                    return newRooms
                })
                if (curRoom && data.message.uuid === curRoom.uuid){
                    setCurRoom(data.message)
                }
            } else if (data.type === T_ROOM_DELETED) {
                setRooms((prev) => prev.filter(r => r.uuid !== data.message))
            } else if (data.type === T_ROOM_JOINED) {
                setRooms(data.message.rooms)
                setUsers(data.message.users)
                setCurRoom(data.message.room)
            } else if (data.type === T_USER_UPDATED) {
                setUsers((prev) => {
                    const updatedUsers = prev.filter(u => u.uuid !== data.message.uuid)
                    updatedUsers.push(data.message)
                    return updatedUsers
                })
            } else if (data.type === T_USERS_UPDATED) {
                setUsers(data.message)
                setSelf(data.message.filter((u: any) => u.uuid === self.uuid)[0])
            } else if (data.type === T_GAME_STARTED) {
                setCurGame(data.message)
            } else if (data.type === T_GIVE_FLAG) {
                setIsReceiveFlag(true)
            } else if (data.type === T_ACCEPT_FLAG) {
                setIsReceiveFlag(false)
            } else if (data.type === T_CATCH_FLAG) {
                setIsReceiveFlag(false)
            } else if (data.type === T_GAME_ENDED) {
                setCurGame(data.message)
            }

        }
      });
    const [curRoom, setCurRoom] = useState<RoomType|null>(null)
    const [isReceiveFlag, setIsReceiveFlag] = useState(false)
    const [curGame, setCurGame] = useState<GameType|null>(null)
    const [users, setUsers] = useState<UserType[]>([])
    const [rooms, setRooms] = useState<RoomType[]>([])
    const [self, setSelf] = useState<UserType>({username: username, uuid: '', isReady: false, sign: -1})
    const createRoom = () => {
        sendJsonMessage({
            action: A_NEW_ROOM,
            data: null
        })}
    const changeRoom = (uuid: string) => {
        sendJsonMessage({
            action: A_CHANGE_ROOM,
            data: uuid
        })}
    const sendReady = () => {
        sendJsonMessage({
            action: A_READY,
            data: null
        })}
    const sendNotReady = () => {
        sendJsonMessage({
            action: A_NOT_READY,
            data: null
        })}
    const giveFlag = (image: number[][]) => {
        sendJsonMessage({
            action: A_GIVE_FLAG,
            data: image
        })}
    const receiveFlag = (image: number[][]) => {
        sendJsonMessage({
            action: A_RECEIVE_FLAG,
            data: image
        })}
    const hasFlag = (image: number[][]) => {
        sendJsonMessage({
            action: A_HAS_FLAG,
            data: image
        })}
    console.log(curGame)
    if (curRoom === null) {
        return (
            <Home
                joinRoom={changeRoom}
                users={users}
                rooms={rooms}
                createRoom={createRoom}
                username={username}/>
        )
    } else if (curRoom.stage === 0) {
        return (
            <Room
                roomName={curRoom.name}
                changeReady={() => {
                    if (!self.isReady){
                        sendReady()
                    } else {
                        sendNotReady()
                    }
                    setSelf(prev => {
                        return {...prev, isReady: !prev.isReady}
                    })
                }}
                users={users}
                leaveRoom={() => changeRoom('')}
                user={self}/>
        )
    } else if (curGame) {
        return (
            <Game
                self={self}
                sendSign={(sign) => {
                    if (self.uuid === curGame.flagHolder.uuid) {
                        giveFlag(sign)
                    } else if (self.uuid === curGame.catcher.uuid) {
                        hasFlag(sign)
                    } else {
                        receiveFlag(sign)
                    }
                }}
                flagHolder={curGame.flagHolder}
                catcher={curGame.catcher}
                users={users}/>
        )
    }

    return (<div>ERROR!</div>)

    

    
}
