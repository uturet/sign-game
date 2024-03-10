import React, { useRef, useState } from 'react';
import './App.css';
import Login from './Login';
import GameCore from './GameCore';

function App() {
  const [username, setUserName] = useState<string>('')

  if (username === '') {
    return (
      <Login setUserName={(name) => setUserName(name)}></Login>
    )
  }

  return (
    <GameCore 
      setUserName={setUserName}
      username={username}></GameCore>
  );
}

export default App;
