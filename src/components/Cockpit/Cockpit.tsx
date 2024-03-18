import { useState } from 'react'
import styles from './Cockpit.module.css'

import { Move } from '../Robot/Robot'
import { GameState } from '../Grid/Grid'

type CockpitProps = {
  onInitRobot: (direction: 'N' | 'O' | 'S' | 'W', moves: ('V' | 'L' | 'R')[]) => void
  onCancelInitRobot: () => void
  onStart: () => void
  onStop: () => void
  onClear?: () => void
  onReset?: () => void
  gameState: GameState
  selectedCell: {
    row: number
    col: number
  } | null
}

const isMove = (moveString: string): moveString is ('R' | 'L' | 'V') => {
  return moveString as ('R' | 'L' | 'V') !== undefined
}

const Cockpit = (props: CockpitProps) => {

  const [moves, setMoves] = useState<('R' | 'L' | 'V')[]>([])
  const [direction, setDirection] = useState<'N' | 'O' | 'S' | 'W'>('N')

  const handleDirectionChange = (inputValue: string) => {
    ( inputValue === 'N' || inputValue === 'S' || inputValue === 'O' || inputValue === 'W') ? setDirection(inputValue) : setDirection('N')
  }

  const makeMoves = (movesString: string): ('R' | 'L' | 'V')[] | null => {
    const moves: ('R' | 'L' | 'V')[] = []

    for (let i = 0; i < movesString.length - 1; i++) {
      let newMove: 'R' | 'L' | 'V' | null = null
      if (isMove(movesString[i])) {
        newMove = movesString[i] as 'R' | 'L' | 'V'
        moves.push(newMove)
      } else return null
      //isMove(movesString[i]) ? moves.push(movesString[i] as 'R' | 'L' | 'V') : return null
    }

    return moves
  }

  const resetState = () => {
    setMoves([])
    setDirection('N')
  }

  const handleInitRobot = () => {
    console.log(props.selectedCell)
    props.onInitRobot(direction, moves)
    resetState()
    //props.onInitRobot()
  }

  const handleCancelInitRobot = () => {
    props.onCancelInitRobot()
    resetState()
  }

  const handleStart = () => {
    props.gameState === GameState.Pausing || props.gameState === GameState.Setup ? props.onStart() : props.gameState === GameState.Running && props.onStop()
  }

  const handleReset = () => {
    props.onReset && props.onReset()
  }

  const handleClear = () => {
    props.onClear && props.onClear()
  }

  const handleMoveButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const buttonName = e.currentTarget.name
    if (buttonName === 'left') addMove('L')
    else if (buttonName === 'right') addMove('R')
    else if (buttonName === 'move') addMove('V')
  }
  
  const addMove = (move: 'R' | 'L' | 'V') => {
    const movesCopy = moves.slice()
    movesCopy.push(move)
    setMoves(movesCopy)
  } 

  return (
    <div className={styles.cockpit}>
      { 
        props.gameState === GameState.InitiatingRobot ? 
          <>
            <div className={styles.settings}>
              <h2>Add Robot</h2>
              <div className={styles.arrowButtons}>
                <button name="left" onClick={handleMoveButtonClick}>&#8592;</button>
                <button name="move" onClick={handleMoveButtonClick}>&#8593;</button>
                <button name="right" onClick={handleMoveButtonClick}>&#8594;</button>
              </div>
              <p>
                {moves}
              </p>
              <p>
                Direction: {direction}
              </p>
              <input placeholder='direction' onChange={(e) => {
                const inputValue = e.target.value
                handleDirectionChange(inputValue)
              }}
              />
              </div>
              <div className={styles.buttons}>
                <button onClick={handleInitRobot} className={styles.button}>Init Robot</button>
                <button onClick={handleCancelInitRobot} className={`${styles.button} ${styles.buttonAttention}`}>Cancel</button>
              </div>
            </>
          : (props.gameState === GameState.Running || props.gameState === GameState.Pausing)
            ? (
              <>
                <p>Running</p>
                  <div className={styles.buttons}>
                    <button onClick={handleStart} className={`${styles.button} ${props.gameState === GameState.Running && styles.buttonAttention}`}>{props.gameState === GameState.Running ? 'Pause' : 'Run'}</button>
                  </div>
              </>
            )
            : props.gameState === GameState.Setup && (
              <>
                <p>To add a Robot<br/>select a Cell on the left</p>
                <div className={styles.buttons}>
                  <button onClick={handleStart} className={styles.button}>Run</button>
                  <button onClick={handleReset} className={styles.button}>Reset</button>
                  <button onClick={handleClear} className={`${styles.button} ${styles.buttonAttention}`}>Clear</button>
                </div>
              </>
            )
        
      
        
      } 
      
    </div>
  )
}

export default Cockpit