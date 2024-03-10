import React, { useState } from 'react'

type LoginProps = {
    setUserName: React.Dispatch<React.SetStateAction<string>>
}

export default function Login({setUserName}: LoginProps) {
    const [value, setValue] = useState<string>('')
    

  return (
    <div className='login'>
        <button
            className={value.length > 0 ? '' : 'disabled'}
            onClick={() => {
                if (value.length > 0) {
                    setUserName(value)
                }
            }}>PLAY</button>

        <input
            onKeyDown={(key) => {
                if (key.code === 'Enter' && value.length > 0) {
                    setUserName(value)
                }
            }}
            className={value.length > 0 ? '' : 'disabled'}
            value={value} 
            onChange={(e) => setValue(e.target.value)} 
            type="text" />
    </div>
  )
}
