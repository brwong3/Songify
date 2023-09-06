import React, {useState, useContext} from 'react'
import "../styles/PlaylistButton.css"
import {motion} from "framer-motion"
import { buttonSelectedContext } from '../utility/Context'

export default function ({name}) {

  const{buttonSelected, setButtonSelected} = useContext(buttonSelectedContext)

  return (
    <motion.button className='Playlist'
      whileHover={{ scale: 1.1 }}
      whileTap={() => {
        setButtonSelected(name)
        return { scale: 0.9 }
      }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      style={buttonSelected == name ? {opacity: "100%" } : {opacity: "70%"}}
    >
        <h1>{name}</h1>
        {/* <div className='Playlist-Underline'></div> */}
    </motion.button>
  )
}
