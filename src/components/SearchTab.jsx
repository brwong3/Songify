import React, {useState, useEffect} from 'react'
import Search from './Search'
import { createContext } from 'react'
import { SwipeableDrawer } from '@mui/material';
import Modal from '@mui/material/Modal';
import {Box} from '@mui/material';
import "../styles/SearchTab.css"
import NewSongPlaylistButton from './NewSongPlaylistButton';
import { motion } from 'framer-motion';
import { serverRequest } from '../utility/Constants';



export const searchResultsContext = createContext();
export const buttonPressedContext = createContext();
export const playSongContext = createContext();
export const updateImageContext = createContext();
export const addToPlaylistContext = createContext();

export default function SearchTab() {
  //Modal On/Off
  const[buttonPressed, setButtonPressed] = useState(false);
  const[searchResults, setSearchResults] = useState([]);
  const[playSong, setPlaySong] = useState("")
  const[updateImage, setUpdateImage] = useState(false);

  const[songData, setSongData] = useState({});
  const[playlists, setPlaylists] = useState([]);

  useEffect(() => {
    fetch(`${serverRequest}/Playlists`)
    .then(response => response.json())
    .then(data => {
      setPlaylists(data.map((element) => <NewSongPlaylistButton name={element.name}></NewSongPlaylistButton>))
    })
  }, [buttonPressed])

  const[addToPlaylist, setAddToPlaylist] = useState([])

  function updatePlaylists() {
    fetch(`${serverRequest}/UpdatePlaylist`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({
        "Playlists" : addToPlaylist,
        "Song": songData
      })
    })
  }

  return (
  <addToPlaylistContext.Provider value={{addToPlaylist, setAddToPlaylist}}>
    <playSongContext.Provider value={{playSong, setPlaySong}}>
      <searchResultsContext.Provider value={{searchResults, setSearchResults}}>
        <buttonPressedContext.Provider value={{buttonPressed, setButtonPressed, songData, setSongData}}>
          <updateImageContext.Provider value={{updateImage, setUpdateImage}}>
              <Search></Search>
                {searchResults}
                <Modal
                  open={buttonPressed}
                  onOpen={() => {}}
                  onClose={() => {
                    setButtonPressed(false);
                    setUpdateImage(!updateImage)
                  }}
                >
                  <div className='NewSong'>
                    <div className='NewSong-MetaData'>
                      <img src={songData.thumbnail} className='NewSong-Thumbnail'></img>
                      <h1 className='NewSong-Title'>{songData.title}</h1>
                    </div>
                    <div className='AddNewSong'>
                      <div className='AddNewSong-Title'>
                        <h3>Playlists</h3>
                        <div className='SearchTab-Divider'></div>
                      </div>
                        {playlists}
                    </div>
                    <div className='Add-Container'>
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        whileHover={{opacity: 0.5}}
                        className='NewSongPlus'
                        onTap={() => {
                          setButtonPressed(false);
                          setUpdateImage(!updateImage)
                          updatePlaylists();
                          setAddToPlaylist([])
                        }}
                      >
                        <h1>Add</h1>
                      </motion.button>
                    </div>
                  </div>
                </Modal>
          </updateImageContext.Provider>
        </buttonPressedContext.Provider>
      </searchResultsContext.Provider>
    </playSongContext.Provider>
  </addToPlaylistContext.Provider>
  )
}
