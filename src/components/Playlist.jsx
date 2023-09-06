import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import "../styles/Playlist.css"
import { serverRequest } from '../utility/Constants';
import { buttonSelectedContext } from '../utility/Context';
import Song from './Song';
import MusicPlayer from "../components/MusicPlayer"
import { MusicPlayerContext } from '../App';
import MenuIcon from "../assets/Menu.png"
import MenuSelected from "../assets/MenuSelected.png"
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Modal from '@mui/material/Modal';
import { refreshContext } from '../pages/Main';
import { playlistContext } from '../pages/Main';
import { playSongContext } from './SearchTab';
import CircularProgress from '@mui/material/CircularProgress';

export const songSelectedContext = createContext();

export default function Playlist({name}) {

  const[search, setSearch] = useState("");
  const[dateCreated, setDateCreated] = useState();
  const[numSongs, setNumSongs] = useState();
  const {buttonSelected, setButtonSelected} = useContext(buttonSelectedContext)
  const[songs, setSongs] = useState([]);

  const{refresh, setRefresh} = useContext(refreshContext)

  const[songSelected, setSongSelected] = useState({});

  const{MusicPlaylist, setMusicPlaylist} = useContext(MusicPlayerContext);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const[deletePlaylist, setDeletePlaylist] = useState(false);
  const[renamePlaylist, setRenamePlaylist] = useState(false);
  const[renamePlaylistInput, setRenamePlaylistInput] = useState("");

  const[errorMessage, setErrorMessage] = useState("");

  const[percentageDownloaded, setPercentageDownloaded] = useState(0);
  const{PlaylistData, setPlaylistData} = useContext(playlistContext);
  const[fetching, setFetching] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if(search.length !== 0) {
      fetch(`${serverRequest}/FilterSongs?Playlist=${name}&term=${search}`)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setSongs(data.map((element) => <Song Refresh={refreshPlaylistData} Playlist={name} id={element.id} thumbnail={element.thumbnail} name={element.name} artist={element.artist} length={element.length} location={element.location} downloaded={element.downloaded}></Song>))
      })
    }
    else {
      fetchSongs();
    }
  }, [search])

  useEffect(() => {
    fetchSongs();
    fetchPlaylistMetaData();
    fetchDownloadedPercentage();
  }, [])

  useEffect(() => {
    fetchPlaylistMetaData()
    fetchSongs();
  }, [buttonSelected])

  useEffect(() => {
    if(renamePlaylistInput.length > 20) {
      setErrorMessage("New Name is Too Long. Max is 20 Characters")
    }
    else if(PlaylistData.map(item => item.name).indexOf(`${renamePlaylistInput}`) !== -1) {
      setErrorMessage("New Name Already In Use")
    }
    else {
      setErrorMessage("")
    }
  }, [renamePlaylistInput.length])

  function fetchPlaylistMetaData() {
    fetch(`${serverRequest}/PlaylistData?name=${name}`)
    .then(response => response.json())
    .then(data => {
      setNumSongs(data.numSongs);
      setDateCreated(data.dateCreated)
    })
  }

  function fetchSongs() {
    fetch(`${serverRequest}/PlaylistSongs?Playlist="${name}"`)
      .then(response => response.json())
      .then(data => {
        setSongs(data.map((element) => <Song Refresh={refreshPlaylistData} Playlist={name} id={element.id} thumbnail={element.thumbnail} name={element.name} artist={element.artist} length={element.length} location={element.location} downloaded={element.downloaded}></Song>))
      })
    }

  function removePlaylist() {
    fetch(`${serverRequest}/DeletePlaylist`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({
        "Name" : name
      })
    });
    setDeletePlaylist(false);
    setRefresh(!refresh);
  }


  function fetchRenamePlaylist() {
    if(errorMessage.length === 0) {
      fetch(`${serverRequest}/RenamePlaylist`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
          "newName" : renamePlaylistInput,
          "oldName": name
        })
      });
      setRenamePlaylist(false);
      setRefresh(!refresh);
    }
  }

  function fetchDownloadedPercentage() {
    fetch(`${serverRequest}/PercentageDownloaded?Playlist=${name}`)
    .then(response => response.json())
    .then(data => {
      setPercentageDownloaded(data.Percentage)
    })
  }

  function DownloadPlaylist() {
    if(percentageDownloaded !== 100) {
      fetch(`${serverRequest}/Download`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
          "Playlist" : name
        })
      });
      setFetching(true)
    }
  }

  useEffect(() => {
    fetchDownloadedPercentage()
  }, [buttonSelected])

  function refreshPlaylistData() {
    fetchSongs();
    fetchPlaylistMetaData();
    fetchDownloadedPercentage();
    console.log("Hello")
  }
  

  return (
    <songSelectedContext.Provider value={{songSelected, setSongSelected}}>
      <div className='Playlist-Content'>
        <div className='Playlist-Settings'>
          <input placeholder='Search...' value={search} onChange={(e) => setSearch(e.target.value)}></input>
          <img src={MenuIcon} onClick={handleClick}></img>
          <Menu

            MenuListProps={{
              sx: {
                backgroundColor: "#071330",
                color: 'white',
                width: "25vh",
                height: "25vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                flexDirection: "column",
                padding: "0",
                border: "1px solid #0B1320",
              },
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            style={{
              borderRadius: "50px"
            }}
          >
            <MenuItem
            sx={{
              fontSize: "1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "10vh",
              borderBottom: "white solid 1px"
            }}
            divider={true}
            onClick={(e) => {
              setAnchorEl(null)
              setRenamePlaylist(true)
              // setDeletePlaylist(true)
            }}>Rename Playlist</MenuItem>
            <MenuItem
            sx={{
              fontSize: "1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "10vh",
              borderBottom: "white solid 1px"
            }}
            divider={true}
            className="MenuItem" 
            onClick={(e) => {
              setAnchorEl(null)
              setDeletePlaylist(true)
            }}>Delete Playlist</MenuItem>
            <MenuItem
            sx={{
              fontSize: "1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "10vh",

            }}
            onClick={(e) => {
              DownloadPlaylist()
            }}
            className="MenuItem" 
            divider={true}
            >
              Download
            </MenuItem>
          </Menu>
          <Modal
            open={deletePlaylist}
            onClose={() => {
              setDeletePlaylist(!deletePlaylist)
            }}
          >
            <div className='Settings'>
              <h1 className='Question'>{`Are You Sure You Want to Delete`}</h1>
              <h1 className='Name'>"{name}"?</h1>
              <div>
                <button onClick={removePlaylist}>Yes</button>
                <button onClick={() => {setDeletePlaylist(false)}}>No</button>
              </div>
            </div>
          </Modal>
          <Modal
            open={renamePlaylist}
            onClose={() => {
              setRenamePlaylist(!renamePlaylist)
            }}
          >
            <div className="Settings">
              <h1 className="RenameQuestion">Enter A New Name</h1>
              <input placeholder="Playlist" value={renamePlaylistInput} onChange={(e) => {setRenamePlaylistInput(e.target.value)}}></input>
              {errorMessage.length !== 0 && <h2 className='Error'>{errorMessage}</h2>}
              <button onClick={fetchRenamePlaylist}>Submit</button>
            </div>
          </Modal>
          <Modal
            open={fetching}
            onClose={() => {
              setFetching(false);
            }}
          >
            <div className="Spinner">
              <CircularProgress></CircularProgress>
            </div>
          </Modal>
        </div>
        <h1>{name}</h1>
        <h6>{percentageDownloaded}% Downloaded</h6>
        <div className='MetaData'>
          <p>{numSongs === 1 ? `${numSongs} Song` : `${numSongs} Songs`}</p>
          <p>Created On {dateCreated}</p>
        </div>
        <div className='Content-Divider'></div>
        <div className='Songs'>
            {songs}
        </div>
        {MusicPlaylist && <MusicPlayer></MusicPlayer>}
      </div>
    </songSelectedContext.Provider>
  )
}
