import React, {useRef, useState} from 'react'
import { GameProps } from './types'
// @ts-ignore
import CanvasDraw from "react-canvas-draw";

const getPlayersCoordinates = (count: number, centerX: number, centerY: number, radius: number, boxSize: number): [number, number][] => {
  const coords: [number, number][] = []


  for (let i = 0; i < count; i++) {
    const anlge_rads = (((360 / count) * i) * Math.PI ) / 180
    coords.push([
      centerX - boxSize / 2 + radius * Math.cos(anlge_rads),
      centerY - boxSize / 2 + radius * Math.sin(anlge_rads)
    ])
  }

  return coords
}

export default function Game({self, users, catcher, flagHolder, sendSign}: GameProps) {
  const canvasRef = useRef<any>()
  const [runners, setRunners] = useState(() => users.filter(u => u.uuid !== catcher.uuid))
  const [coords, setCoords] = useState(() => getPlayersCoordinates(
    users.length-1, 200, 200, 200, 0
  ))

  return (
    <div className='game-wrapper'>
        <div className='game'>
          <div>Your Sign is: {self.sign}</div>
            <div>{self.uuid === flagHolder.uuid ? 'You Have a flag': ''}{self.uuid === catcher.uuid ? 'You are cather': ''}</div>
            {coords.map((coord, i) => 
              <div key={coord.toString()} className='player' style={{left: coord[0], top: coord[1]}}>
                <div className='player-sign'>{runners[i].sign}</div>
                <div className='player-drawing'>{runners[i].uuid === flagHolder.uuid && self.uuid !== catcher.uuid ? 'Flag' : ''}</div>
              </div>
            )}
            <div className='player middle' 
              style={{left: 200, top: 200}}>

              <div className='player-sign'>{catcher.sign}</div>
              <div className='player-drawing'></div>
            </div>
        </div>

        <div className='drawing'>
          <span className='btn'
                onClick={() => {
                  const canvas = canvasRef.current.canvas.drawing;
                  const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
                  const coof = 28 / canvas.width
                  const image = Array.from({ length: 28 }, () => Array(28).fill(0))
                  for (let y = 0; y < canvas.width; y++) {
                    for (let x = 0; x < canvas.height; x++) {
                      image[Math.floor(y*coof)][Math.floor(x*coof)] = imageData[((x + y * canvas.width) * 4) + 3]
                    }
                  }
                  sendSign(image)
                  }}>Send</span>
          <span className='btn'
          onClick={() => canvasRef.current.clear()}>Clear</span>

        <CanvasDraw
              ref={canvasRef}/>
        </div>

    </div>
  )
}
