import React, { useState, useEffect} from 'react'
import "../styles/Main.css"
import Music from "../assets/Music.png"
import Magnify from "../assets/Search.png"
import Plus from "../assets/Plus.png"
import { motion, AnimatePresence, backIn} from 'framer-motion'
import Search from '../components/Search'
import SearchResult from '../components/SearchResult'
import { serverRequest } from '../utility/Constants'
import PlaylistButton from '../components/PlaylistButton'
import { createContext } from 'react'
import SearchTab from '../components/SearchTab'
import Modal from '@mui/material/Modal';
import { Box } from '@mui/material'
import { buttonSelectedContext } from '../utility/Context'
import Playlist from "../components/Playlist"
import "../styles/Playlist.css"

export const refreshContext = createContext();
export const playlistContext = createContext();

export default function Main() {

  const[newPlaylist, setNewPlaylist] = useState(false)
  const[newPlaylistName, setNewPlaylistName] = useState("")
  const[Playlists, setPlaylists] = useState([]);
  const[buttonSelected, setButtonSelected] = useState("Search");
  const[PlaylistData, setPlaylistData] = useState("");
  const[errorMessage, setErrorMessage] = useState("");

  const[refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchNewPlaylists()
    setButtonSelected("Search")
  }, [refresh])

  function fetchNewPlaylists () {
      fetch(`${serverRequest}/Playlists`)
        .then(response => response.json())
        .then(data => {
          setPlaylistData(data)
          setPlaylists(data.map((element) => <PlaylistButton key={element.id} name={element.name}></PlaylistButton>))
        })
    }

  useEffect(() => {
    fetchNewPlaylists();
  }, [newPlaylist])

  useEffect(() => {
    if(newPlaylistName.length > 20) {
      setErrorMessage("New Name is Too Long. Max is 20 Characters")
    }
    else if(PlaylistData !== "" && PlaylistData.map(item => item.name).indexOf(`${newPlaylistName}`) !== -1) {
      setErrorMessage("New Name Already In Use")
    }
    else {
      setErrorMessage("")
    }
  }, [newPlaylistName.length])

  function createNewPlaylist() {
    if(errorMessage.length === 0) {
      fetch(`${serverRequest}/NewPlaylist`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
          "Name" : newPlaylistName
        })
      }).then(() => {
        fetchNewPlaylists()
      })
      setNewPlaylistName("");
      setNewPlaylist(false);
    }
  }

  function handleEnter(e) {
    if(e.keyCode === 13) {
      createNewPlaylist();
    }
  }

  function determineContent() {
    switch(buttonSelected) {
      case "Search":
        return <SearchTab></SearchTab>
        break;
      default:
        return <Playlist name={buttonSelected}></Playlist>
    }
  }

  return (
    <playlistContext.Provider value={{PlaylistData, setPlaylistData}}>
      <refreshContext.Provider value={{refresh, setRefresh}}>
        <buttonSelectedContext.Provider value={{buttonSelected, setButtonSelected}}>
          <div className='Main'>
            <div className='Drawer'>
              <img src={Music} alt="Music"></img>
              <h1>Songify</h1>
              <div className='Divider'></div>
              <motion.button 
                className='Search-Button'
                whileTap={() => {
                    setButtonSelected("Search")
                    return { scale: 0.9 }
                  }}
                >
                <div>
                  <img src={Magnify} alt="Music"></img>
                  <h2>Search</h2>
                </div>
              </motion.button>
              <div className='Divider'></div>
              <div className='Playlists'>
                <div className='Playlists-Title'>
                  <h3>Playlists </h3>
                  <motion.button 
                    className="Plus"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{opacity: 0.5}}
                    onTap={() => {
                      setNewPlaylist(true)
                    }}
                  >
                    <img src={Plus}></img>
                  </motion.button>
                </div>
                <div className='Playlist-List'>
                  <Modal
                    open={newPlaylist}
                    onOpen={() => fetchNewPlaylists()}
                    onClose={() => {setNewPlaylistName("")}}
                    onBackdropClick={() => setNewPlaylist(!newPlaylist)}
                    className='New-Playlist'
                  >
                    <div className="Settings">
                      <h1 className="RenameQuestion">Enter A Name</h1>
                      <input placeholder="Playlist" value={newPlaylistName} onChange={(e) => {setNewPlaylistName(e.target.value)}} onKeyDown={handleEnter}></input>
                      {errorMessage.length !== 0 && <h2 className='Error'>{errorMessage}</h2>}
                      <button onClick={createNewPlaylist}>Submit</button>
                    </div>
                  </Modal>
                    {Playlists.length === 0 ? <div className='Instructions'><h1>Click the Plus to Create</h1><h1>Your First Playlist!</h1></div> : Playlists}
                </div>
              </div>
            </div>
              <div className='Content'>
                {determineContent()}
              </div>
          </div>
        </buttonSelectedContext.Provider>
      </refreshContext.Provider>
    </playlistContext.Provider>
  )
}
