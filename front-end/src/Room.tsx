import React, { useState } from 'react'
import UserItem from './UserItem'
import { RoomProps } from './types'



export default function Room({roomName, user, leaveRoom, changeReady, users}:RoomProps) {
  return (
    <div className='home'>
      <div className='head'>
          <span 
            onClick={changeReady}
            className='btn'>{user.isReady ? 'Not Ready' : 'Ready'}</span>
          <span 
            onClick={leaveRoom}
            className='btn'>Leave Room</span>
          <span>{roomName}</span>
          <span>{user.username}</span>
      </div>
      <div className='user-list'>
        {users.map((u) => <UserItem 
          key={u.uuid} 
          isReady={u.isReady}
          username={u.username}/>)}
      </div>
    </div>
  )
}
