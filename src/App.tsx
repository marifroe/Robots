import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Grid from './components/Grid/Grid'

const GRID_WIDTH = 7
const GRID_HEIGHT = 5

function App() {
  return (
    <>
      <Grid width={GRID_WIDTH} height={GRID_HEIGHT} />
    </>
  )
}

export default App
