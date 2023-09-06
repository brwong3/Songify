import React, {useState, useContext, useEffect, useRef} from 'react'
import ReactPlayer from 'react-player'
import "../styles/MusicPlayer.css"
import { Slider } from '@mui/material';
import Pause from "../assets/Pause.png"
import Rewind from "../assets/Rewind.png"
import ShufflePressed from "../assets/Shuffle.png"
import FastForward from "../assets/FastForward.png"
import Repeat from "../assets/Repeat.png"
import { MusicPlayerContext } from '../App';
import { serverRequest } from '../utility/Constants';
import Play from "../assets/Play.png"
import RepeatPressed from "../assets/RepeatPressed.png"
import Shuffle from "../assets/ShufflePressed.png"
import offline from 'offline';
import { motion} from 'framer-motion'
 


export default function MusicPlayer() {

  const[songName, setSongName] = useState();
  
  const[slider, setSlider] = useState(0);
  const[songLength, setSongLength] = useState("0:00")

  const{MusicPlaylist, setMusicPlaylist} = useContext(MusicPlayerContext);
  const[playedSeconds, setPlayedSeconds] = useState();

  const MusicPlayer = useRef();
  const[playingMusic, setPlayingMusic] = useState(true);
  const[shuffle, setShuffle] = useState(false);
  const[loop, setLoop] = useState(false);
  const[muted, setMuted] = useState(false);

  const[originalListOfSongs, setOriginalListOfSongs] = useState([])
  const[shuffledListOfSongs, setShuffledListOfSongs] = useState([]);
  const[songsPlayed, setSongsPlayed] = useState([])
  const[songPlaying, setSongPlaying] = useState(MusicPlaylist.Song)
  const[songsYetToPlay, setSongsYetToPlay] = useState([]);
  const[numSongs, setNumSongs] = useState(0);


  useEffect(() => {
    fetch(`${serverRequest}/PlaylistData?name=${MusicPlaylist.Playlist}`)
    .then(response => response.json())
    .then(data => {
      setNumSongs(data.numSongs);
      if(data.numSongs === 1) {
        setLoop(true);
      }
    })

  }, [MusicPlaylist.Playlist]);

  useEffect(() => {
    setSongPlaying(MusicPlaylist.Song);
    fetch(`${serverRequest}/PlaylistSongs?Playlist="${MusicPlaylist.Playlist}"`)
    .then(response => response.json())
    .then(data => {
      if(offline()) {
        data = data.filter(item => item.downloaded !== 0)
      }
      const objWithIndex = data.findIndex((obj) => obj.id === MusicPlaylist.Song.id)
      //console.log(objWithIndex)
      if(objWithIndex !== 0) {
        data.splice(0, objWithIndex + 1)
      }
      if(data.length === 0) {
          fetch(`${serverRequest}/PlaylistSongs?Playlist="${MusicPlaylist.Playlist}"`)
          .then(response => response.json())
          .then(data => {
            if(offline()) {
              data = data.filter(item => item.downloaded !== 0)
            }
            setSongsYetToPlay(data)
          })
        }
      else {
        setSongsYetToPlay(data);
      }
    })
  }, [MusicPlaylist.Song])

  useEffect(() => {
    if(shuffle) {
      fetch(`${serverRequest}/PlaylistSongs?Playlist="${MusicPlaylist.Playlist}"`)
      .then(response => response.json())
      .then(data => {
        if(offline()) {
          data = data.filter(item => item.downloaded !== 0)
        }
        setSongsYetToPlay(shuffleSongs(data))
      })
    }
    else {
      fetch(`${serverRequest}/PlaylistSongs?Playlist="${MusicPlaylist.Playlist}"`)
      .then(response => response.json())
      .then(data => {
        if(offline()) {
          data = data.filter(item => item.downloaded !== 0)
        }
        const objWithIndex = data.findIndex((obj) => obj.id === songPlaying.id)
        //console.log(objWithIndex)
        if(objWithIndex !== 0) {
          data.splice(0, objWithIndex + 1)
        }
        setSongsYetToPlay(data)
      })
    }
  }, [shuffle])

  useEffect(() => {
    console.log(songsYetToPlay)
  }, [songsYetToPlay])

  function nextSong() {
    setSongsPlayed([...songsPlayed, songPlaying]);
    if(songPlaying.id === songsYetToPlay[0].id) {
      //console.log("Works")
      songsYetToPlay.shift()
      setSongsYetToPlay([...songsYetToPlay])
    }
    setSongPlaying(songsYetToPlay[0]);
    songsYetToPlay.shift();
    setSongsYetToPlay([...songsYetToPlay])
    if(songsYetToPlay.length === 0) {
      fetch(`${serverRequest}/PlaylistSongs?Playlist="${MusicPlaylist.Playlist}"`)
      .then(response => response.json())
      .then(data => {
        if(offline()) {
          data = data.filter(item => item.downloaded !== 0)
        }
        if(shuffle) {
          setSongsYetToPlay(shuffleSongs(data))
        }
        else {
          setSongsYetToPlay(data)
        }
      })
    }
  }

  function convertToTimeStamp(number) {
    let minutes = Math.floor(number/60);
    let seconds = number % 60
    if(minutes === 0 && seconds === 0) {
      return "0:00"
    }
    else if(seconds < 10) {
      return `${minutes}:0${seconds}`
    }
    return `${minutes}:${seconds}`
  }

  function shuffleSongs(arr) {
    for (let i = arr.length - 1; i > 0; i--)
    {
     
        // Pick a random index from 0 to i inclusive
        let j = Math.floor(Math.random() * (i + 1));
 
        // Swap arr[i] with the element
        // at random index
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function convertToSeconds(fraction) {
    return fraction * MusicPlayer.current.getDuration();
  }

  return (
    <div className='MusicPlayer'>
      <div className='MusicPlayer-MetaData'>
        <img src={songPlaying.thumbnail}></img>
        <h1>{songPlaying.name}</h1>
      </div>
      <div className='Slider'>
        <h2>{playedSeconds}</h2>
        <Slider className="Slider" min={0} max={1} value={slider} step={0.001} sx={{width: "80%", marginTop: "3px"}}
          onChange={(_, value) => {
            setSlider(value);
            MusicPlayer.current.seekTo(convertToSeconds(slider), 'seconds');
          }}
        ></Slider>
        {/* //url={`https://youtu.be/${songPlaying.id}`} */}
        {MusicPlaylist && 
          <ReactPlayer url={songPlaying.location} playing={playingMusic} controls={false} width={0} height={0}
            ref={MusicPlayer}
            loop={loop}
            muted={muted}
            onEnded={() => {
              nextSong()
            }}
            onProgress={(progress) => {
              setPlayedSeconds(convertToTimeStamp(Math.ceil(progress.playedSeconds)))
              setSlider(progress.playedSeconds/MusicPlayer.current.getDuration())
              //console.log(slider)
            }}
          />}
        <h2>{songPlaying.length}</h2>
      </div>
      <div className='Controls'>
        <button><img src={shuffle ? Shuffle : ShufflePressed} onClick={() => {
          setShuffle(!shuffle)

        }}></img></button>
        <button><img src={Rewind} onClick={() => {
          if(numSongs !== 1) {
            if(songsPlayed.length !== 0) {
              setSongPlaying(songsPlayed[songsPlayed.length - 1])
              let songsPlayedArray = songsPlayed.pop();
              setSongsPlayed([...songsPlayed])
              let songsYetToPlayArray = songsYetToPlay.unshift(songPlaying);
              setSongsYetToPlay([...songsYetToPlay])
            }
          }
        }}></img></button>
        <button className='Pause' onClick={() => setPlayingMusic(!playingMusic)}><img src={playingMusic ? Pause : Play}></img></button>
        <button><img src={FastForward} onClick={() => {
          if(numSongs !== 1) {
            nextSong();
          }
        }}></img></button>
        <button onClick={() => {
          if(numSongs === 1) {
            setLoop(true)
          }
          else {
            setLoop(!loop)
          }
          }}
        >
          <img src={loop ? RepeatPressed : Repeat}></img>
        </button>
      </div>
    </div>
  )
}
