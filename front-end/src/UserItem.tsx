import React from 'react'
import { UserItemProps } from './types'


export default function UserItem({username, isReady}: UserItemProps) {
  return (
    <div className='user-item'>
        <span>{username}</span>
        {isReady ? (<span> Ready</span>) : ''}
    </div>
  )
}
