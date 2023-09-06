import React, { useEffect, useState } from 'react'
import "../styles/SignIn.css"
import { motion } from "framer-motion"
import { serverRequest } from '../utility/Constants';


export default function SignIn() {

  const[email, setEmail] = useState("");
  const[password, setPassword] = useState("")



  function createNewUser() {
    fetch(`${serverRequest}/CreateUser`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({
        "Email": email,
        "Password": password
      })
    })
  }

  return (
    <div className='SignIn'>
      <h1>Songify</h1>
      <h4>For All Of Your Listening Needs</h4>
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.3,
          delay: 0.5,
          ease: [0, 0.71, 0.2, 1.01]
        }} 
        className='SignIn-Container'>
        <div className='Email'>
          <p>Email:</p>
          <input type="text" value={email} onChange={(e) => {setEmail(e.target.value)}}></input>
        </div>
        <div className='Password'>
          <p>Password:</p>
          <input type="password" value={password} onChange={(e) =>{setPassword(e.target.value)}}></input>
        </div>
        <div className='Authenticate'>
          <button onClick={createNewUser}>Log In</button>
        </div>
        <div className="Google">
          <button></button>
        </div>
      </motion.div>
    </div>
  )
}
