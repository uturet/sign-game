import React from 'react'
import { RoomItemProps } from './types'


export default function RoomItem({name, users, joinRoom}: RoomItemProps) {

  return (
    <div className="room-item">
        <span 
          onClick={joinRoom}
          className='join'>JOIN</span>
        <span>{name}</span>
        <span>{users}</span>
    </div>
  )
}
