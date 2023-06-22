import React from 'react'
import "../styles/SignIn.css"
import { motion } from "framer-motion"


export default function SignIn() {
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
          <input></input>
        </div>
        <div className='Password'>
          <p>Password:</p>
          <input></input>
        </div>
        <div className='Authenticate'>
          <button>Log In</button>
        </div>
      </motion.div>

    </div>
  )
}
