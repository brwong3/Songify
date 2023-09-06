import React, { useEffect, useContext} from 'react'
import "../styles/SongSearch.css"
import Plus from "../assets/Plus.png"
import { motion } from 'framer-motion'
import { useState } from 'react'
import Add from "../assets/Add.png"
import addSelected from "../assets/Add-Selected.png"
import { buttonPressedContext } from '../components/SearchTab'
import ReactPlayer from 'react-player/youtube'
import { playSongContext } from '../components/SearchTab'
import { updateImageContext } from '../components/SearchTab'



export default function SearchResult({thumbnail, title, artist, length, id, link}) {

  const{playSong, setPlaySong} = useContext(playSongContext)
  const[songSelected, setSongSelected] = useState(false);
  const{buttonPressed, setButtonPressed} = useContext(buttonPressedContext);
  const[imageShown, setImageShown] = useState(Add);
  const{updateImage} = useContext(updateImageContext);
  const{songData, setSongData} = useContext(buttonPressedContext);


  useEffect(() => {
    if (buttonPressed == false && imageShown == addSelected) {
      setImageShown(Add)
      setPlaySong(false);
    }
  }, [updateImage])


  function click() {
    if(buttonPressed == false && imageShown == Add) {
      setImageShown(addSelected)
      setButtonPressed(true);
    }
    else if(buttonPressed == true && imageShown == addSelected) {
      setImageShown(Add);
      setButtonPressed(false);
    }
  }

  return (
  <>
    {playSong === id && <ReactPlayer url={link} playing={playSong} controls={false} width={0} height={0}/>}
    <motion.div className='Song-Search' 
      whileHover={() => {
        return {opacity: "50%"}
      }}
      whileTap={() => {
        setPlaySong(id)
        return {scale: 0.99}
      }
      }>
      <img src={thumbnail}></img>
      <div className='Song-Search-MetaData'>
        <h1>{title}</h1>
        <h2>{artist} - {length}</h2>
      </div>
      <motion.button
        whileTap={{ scale: 1.1 }}
        whileHover={{opacity: 0.5, scale: 0.9}}
        className='Plus-Button' 
        onClick={() => {
          click();
          setSongData({
            "thumbnail": thumbnail,
            "title": title,
            "artist": artist,
            "length": length,
            "id": id
          })
        }}
      >
        <img id="Plus" src={imageShown}>
        </img>
      </motion.button>
    </motion.div>
  </>
  )
}
