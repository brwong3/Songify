import React, { useContext, useEffect, useState } from 'react'
import { motion} from 'framer-motion'
import "../styles/Song.css"
import Downloaded from "../assets/Downloaded.png"
import { songSelectedContext } from './Playlist'
import { MusicPlayerContext } from '../App'
import { useLongPress } from 'use-long-press'
import Delete from "../assets/Delete.png"
import offline from 'offline';
import { serverRequest } from '../utility/Constants'
import "../styles/Playlist.css"
import Modal from '@mui/material/Modal';
import { CircularProgress } from '@mui/material'


export default function Song({Refresh, Playlist, thumbnail, name, artist, length, id, location, downloaded}) {

  const{songSelected, setSongSelected} = useContext(songSelectedContext)
  const{MusicPlaylist, setMusicPlaylist} = useContext(MusicPlayerContext);
  const[options, setOptions] = useState(false);
  const[deleteSongModal, setDeleteSongModal] = useState(false)


  useEffect(() => {
    if(songSelected.name === name) {
      setMusicPlaylist({
        "Playlist": Playlist,
        "Song": songSelected
      });
    }
  },[songSelected])

 async function deleteSong() {
    await fetch(`${serverRequest}/DeleteSong`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({
        "Playlist" : Playlist,
        "id": id
      })
    })
    await Refresh();
    await setDeleteSongModal(false);
  }

  return (
    <motion.div
      className='SongContainer'
      whileHover={() => {
        setOptions(true)
      }}
      onHoverEnd={() => {
        setOptions(false)
      }}
    >
      <motion.div
        className='Song'
        whileHover={() => {
          return offline() && downloaded === 1 ? {opacity: 0.5, scale: 0.95} : { opacity: 0.5, scale: 1};
        }}
        onTap={() => {
        if(!offline()) {
          setSongSelected({
            "thumbnail" : thumbnail,
            "name" : name,
            "artist": artist,
            "length" : length,
            "id" : id,
            "location": location,
            "downloaded": downloaded
          })
        }
        else if(offline() && downloaded === 1) {
          setSongSelected({
            "thumbnail" : thumbnail,
            "name" : name,
            "artist": artist,
            "length" : length,
            "id" : id,
            "location": location,
            "downloaded": downloaded
          })
        }
          return offline() && downloaded === 1 ? {opacity: 0.5, scale: 1} : { opacity: 0.5, scale: 1};
        }}
        style={offline() && downloaded === 0 ? {opacity: 0.5} : {opacity: 1}}
      >
        <img src={thumbnail}></img>
        <div className='Song-MetaData'>
          <h1>{name}</h1>
          <h2>{artist} - {length}</h2>
        </div>
      </motion.div>
      {options && <motion.div 
        className='RemoveSong' 
        onTap={() => {
          setDeleteSongModal(true)
          deleteSong()
          return {opacity: 0.8, scale: 0.95}
        }} 
        animate={{ x: [25, 0] }}
        >
          Delete
        </motion.div>}
    </motion.div>
  )
}