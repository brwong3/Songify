import { createContext, useState } from 'react';
import './App.css';
//import SignIn from './pages/SignIn';
import Main from './pages/Main';

export const MusicPlayerContext = createContext();

function App() {

  const[MusicPlaylist, setMusicPlaylist] = useState();

  return (
    <MusicPlayerContext.Provider value={{MusicPlaylist, setMusicPlaylist}}>
      <div className='container'>
        <Main/>
      </div>
    </MusicPlayerContext.Provider>
  );
}

export default App;
