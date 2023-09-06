import React, {useContext, useState, useEffect} from 'react'
import "../styles/NewSongPlaylistButton.css"
import Checkmark from "../assets/Checkmark.png"
import Add from "../assets/Add.png"
import { motion } from 'framer-motion'
import { addToPlaylistContext } from './SearchTab'

export default function NewSongPlaylistButton({name}) {

  const[selected, setSelected] = useState(false);
  const{addToPlaylist, setAddToPlaylist} = useContext(addToPlaylistContext);

  function updateAddToPlaylist() {
    // if(!selected) {
    //   let addToPlaylistArray = addToPlaylist.push(name);
    //   setAddToPlaylist(addToPlaylistArray)
    //   alert("Hello")
    // }
    // else {
    //   var idx = addToPlaylist.indexOf(`${name}`);
    //   if(idx !== -1) {
    //     let addToPlaylistArray = addToPlaylist.splice(idx, 1);
    //     setAddToPlaylist(addToPlaylistArray);
    //   }
    // }
    if(!selected) {
      let addToPlaylistArray = addToPlaylist.push(name);
      //console.log(addToPlaylist)
    }
    else {
      var idx = addToPlaylist.indexOf(name);
      if(idx !== -1) {
        let addToPlaylistArray = addToPlaylist.splice(idx, 1);
      }
      console.log(addToPlaylist)
    }
  }

  return (
    <div className='NewSongPlaylistButton'>
        <h1 style={selected ? {opacity: "100%" } : {opacity: "90%"}}>{name}</h1>
        <motion.button 
            onTap={() => {
              setSelected(!selected)
              updateAddToPlaylist();
              return { scale: 0.9 }
            }}
            whileHover={{opacity: 0.5}}
            className='NewSongPlus'
        >
            <img src={selected ? Checkmark : Add}></img>
        </motion.button>
    </div>
  )
}
