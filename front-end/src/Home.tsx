import React from 'react'
import UserItem from './UserItem'
import RoomItem from './RoomItem'
import { HomeProps } from './types'



export default function Home({
  username, createRoom, users, rooms, joinRoom
}: HomeProps) {

  return (
    <div className='home'>
      <div className='head'>
          <span 
            onClick={createRoom}
            className='btn'>Create Room</span>
          <span>{username}</span>
      </div>
      <div className='user-list'>
        {users.map((user) => <UserItem 
          key={user.uuid} 
          isReady={false}
          username={user.username}/>)}
      </div>
      <div className='room-list'>

        {rooms.map((room) => <RoomItem 
            key={room.uuid}
            joinRoom={() => joinRoom(room.uuid)}
            users={room.usersCount}
            name={room.name}/>)}
      </div>
    </div>
  )
}

