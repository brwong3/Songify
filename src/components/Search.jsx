import React, {useContext, useEffect, useState} from 'react'
import "../styles/Search.css"
import { serverRequest } from '../utility/Constants';
import SearchResult from './SearchResult';
import { searchResultsContext} from "./SearchTab";
import { updateImageContext } from './SearchTab';
import offline  from 'offline';
import WifiDisconnected from "../assets/WifiDisconnect.png"
import WifiConnected from "../assets/WifiConnect.png"

export default function () {

    const[searchTerm, setSearchTerm] = useState(null);
    const {setSearchResults} = useContext(searchResultsContext);

    useEffect(() => {
        const getData = setTimeout(() => {
            if(searchTerm !== null) {
                fetch(`${serverRequest}/Search/${searchTerm}`)
                .then(response => response.json())
                .then(data => {
                    setSearchResults(data.map((element) => <SearchResult thumbnail={element.thumbnail} title={element.title} artist={element.channel.name} length={element.durationString} id={element.id} link={element.link}></SearchResult>))
                })
            }
        }, 100)

        return () => clearTimeout(getData)
    }, [searchTerm])



    return (
        <>
            <div className='Search'>
                <div>
                    <input type="text" placeholder='Search...' value={searchTerm} onChange={(e) => {if(!offline()) {setSearchTerm(e.target.value)}}}></input>
                </div>
            </div>
            {searchTerm === null && offline() && 
                <div className='Connection'>
                    <img src={WifiDisconnected}></img>
                    <h1>Wifi Disconnected</h1>
                    <h1>Please Try Again Later</h1>
                </div>
            }
            {searchTerm === null && !offline() &&
                <div className='Connection'>
                    <img src={WifiConnected}></img>
                    <h1>Wifi Connected</h1>
                    <h1>Happy Searching!</h1>
                </div>
            }
        </>

    )
}
