import { useState, useRef, useEffect } from 'react'

import styles from './Grid.module.css'
import Cell from '../Cell/Cell'
import Cockpit from '../Cockpit/Cockpit'
import Robot, { Move } from '../Robot/Robot'

type GridProps = {
  width: number
  height: number
}

export type Position = {
  row: number
  col: number
  orientation: 'N' | 'O' | 'S' | 'W'
}

type RobotMove = {
  robotId: number
  moves: ('V' | 'R' | 'L')[]
  currentStep: number
  currentPosition: Position
  arrived: boolean
}

export enum GameState {
  Setup,
  Running,
  Pausing,
  InitiatingRobot
}

enum Moves {
  'V', 'R', 'L', null
}

enum Orientations {
  'N', 'O', 'S', 'W'
}

/*enum CellState {
  Blocked = "blocked",
  Taken = 0,
  Vacant = "vacant",
  Selected = "selected"
}*/

const Grid = ({
  width,
  height
}: GridProps) => {

  /**
   * Init empty grid
   */
  const [cells, setCells] = useState<(null | number)[][]>(Array(height).fill(Array(width).fill(null)))
  const [gameState, setGameState] = useState(GameState.Setup)
  const [robots, setRobots] = useState<RobotMove[]>([])
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null)
  const robotIdRef = useRef(1)
  const intervalIdRef = useRef(-1)
  const robotsInitialRef = useRef(robots) 

  const incrementRobotId = () => {
    robotIdRef.current = robotIdRef.current + 1
  }

  const handleCellSelected = (selected: boolean, r: number, c: number) => {
    console.log(`cell clicked at row: ${r} and col: ${c}`)
    
    if (gameState === GameState.Setup && selected) {
      console.log(`new game state: ${GameState.InitiatingRobot}`)
      setGameState(GameState.InitiatingRobot)
      //updateCellState(r, c, CellState.Selected)
      selectCell(true, r, c)
    } else if (!selected) {
      selectCell(false, r, c)
    }
  }

  /*const updateCellState = (row: number, col: number, state: CellState) => {
    let gridCopy: CellState[][] = cells.slice() //JSON.parse(JSON.stringify(cells))
      let newRow = cells[row].slice()
      newRow[col] = state
      gridCopy[row] = newRow
      setCells(gridCopy)
  }*/

  const selectCell = (select: boolean, row?: number, col?: number) => {
    console.log(`${!select ? 'not ': ''}setting selected cell ${select && 'to: '} ${row && row}, ${col && col}`)
    select && row && col ? setSelectedCell({ row: row, col: col }) : setSelectedCell(null)
    if (gameState === GameState.InitiatingRobot) setGameState(GameState.Setup)
  }

  const addRobot = (position: Position, moves: ('V' | 'L' | 'R')[]) => {
    let robotsCopy = robots.slice()
    robotsCopy.push({ robotId: robotIdRef.current, moves: moves, currentStep: 0, currentPosition: { row: position.row, col: position.col, orientation: position.orientation }, arrived: false})
    setRobots(robotsCopy)
    placeRobotInCell(position.row, position.col, robotIdRef.current)
    incrementRobotId()
  }

  /**
   * Handle robot initialized
   * @param move The move settings of the robot
   */
  const handleInitRobot = (orientation: 'N' | 'O' | 'S' | 'W', moves: ('V' | 'L' |'R')[]) => {
    console.log('received init')
    selectedCell && addRobot({ row: selectedCell.row, col: selectedCell.col, orientation: orientation }, moves)
    setGameState(GameState.Setup)
    setSelectedCell(null)
    
    /*let newMove: Move = {
      row: 3,
      col: 3,
      direction: 'N',
      moves: ['R', 'V', 'V', 'L', 'V', 'L']
    }*/
  }

  const calculateNextRound = () => {
    let arrived = 0
    //console.log(robots)
    setRobots(robots => {
      let newRound: RobotMove[] = robots.map(robot => {

      // create deep copy of robot (spread operator doesn't do deep copy!)
      let robotCopy: RobotMove = JSON.parse(JSON.stringify(robot))                                                                     
      
      // do nothing if robot is set to done/arrived
      if (robotCopy.arrived) {                                                                            
        arrived++
        return robotCopy
      }

      // set robot to arrived if all steps are taken
      if (!(robotCopy.currentStep < robotCopy.moves.length)) {
        robotCopy = {
          ...robotCopy,
          arrived: true
        }
        console.log(`Robot ${robotCopy.robotId} arrived.`)
        return robotCopy
      }

      // check if robot can walk and where
      let nextPosition = moveRobot(robotCopy.currentPosition, robotCopy.moves[robotCopy.currentStep])
      
      if (nextPosition) {
        //updateCellState(nextPosition.y, nextPosition.x, CellState.Blocked)
        removeRobotFromCell(robotCopy.currentPosition.row, robotCopy.currentPosition.col, robotCopy.robotId)
        placeRobotInCell(nextPosition.row, nextPosition.col, robotCopy.robotId)
        robotCopy = {
          ...robotCopy,
          currentPosition: nextPosition,
          currentStep: robotCopy.currentStep + 1
        }
        //robotCopy.currentPosition = nextPosition
        //robotCopy.currentStep = robot.currentStep + 1
        console.log(`Moving robot ${robotCopy.robotId} to row ${nextPosition.row} col ${nextPosition.col} with orientation ${nextPosition.orientation}`)
      } 
      return robotCopy
    })

    //console.log(newRound)

    if (arrived === robots.length) {
      setGameState(GameState.Setup)
      return robots
    } else return newRound
    })
    
  }

  const removeRobotFromCell = (row: number, col: number, robotId: number) => {
    setCells(cellsPrev => {

      // create copy of nested array
      let gridCopy = cellsPrev.map(row => row.slice()) //JSON.parse(JSON.stringify(cells))

      // place robot in cell if cell is not taken by other robot
      if (gridCopy[row - 1][col - 1] === robotId) {
        gridCopy[row - 1][col - 1] = null
      }
      return gridCopy
    })    
  }

  const placeRobotInCell = (row: number, col: number, robotId: number) => {

    setCells(cellsPrev => {

      // create copy of nested array
      let gridCopy = cellsPrev.map(row => row.slice()) //JSON.parse(JSON.stringify(cells))

      // place robot in cell if cell is not taken by other robot
      if (!gridCopy[row - 1][col - 1]) {
        gridCopy[row - 1][col - 1] = robotId
      }
      return gridCopy
    })    
  }


  /**
   * Returns robot's new position if valid move. Returns null if robot cannot move.
   * @param currentPosition 
   * @param move 
   * @returns 
   */
  const moveRobot = (currentPosition: Position, move: 'V' | 'L' | 'R'): Position | null => {
    let orientation = currentPosition.orientation
    let row = currentPosition.row
    let col = currentPosition.col
    const rangeX = width
    const rangeY = height
    console.log(`move: ` + move)
    switch (move) {
      case 'L':
        if (orientation === 'N') orientation = 'W'
        else if (orientation === 'O') orientation = 'N'
        else if (orientation === 'S') orientation = 'O'
        else if (orientation === 'W') orientation = 'S'
        break
      case 'R':
        if (orientation === 'N') orientation = 'O'
        else if (orientation === 'O') orientation = 'S'
        else if (orientation === 'S') orientation = 'W'
        else if (orientation === 'W') orientation = 'N'
        break
      case 'V':
        if (orientation === 'N' && row > 1) row = row - 1
        else if (orientation === 'O' && col < rangeX) col += 1
        else if (orientation === 'S' && row < rangeY) row += 1
        else if (orientation === 'W' && col > 1) col -= 1

        /*
          Works fine if robot walks towards edge, is turned around and then keeps walking.
          But does not work if robot walks towards edge, stays in place and rotates towards edge again.
        */
        /*if (orientation === 'N') row = row - 1
        else if (orientation === 'O') col += 1
        else if (orientation === 'S') row += 1
        else if (orientation === 'W') col -= 1*/

        // turn robot around 180 degrees if facing border of grid
        if (col === rangeX && orientation === 'O') orientation = 'W'
        if (col === 1 && orientation === 'W') orientation = 'O'
        if (row === 1 && orientation === 'N') orientation = 'S'
        if (row === rangeY && orientation === 'S') orientation = 'N'
        break
      default:
        break
    }

    //console.log('row: ' + row + 'col' + col)
    // if cell is vacant return new pos, else return null (robot cannot move because next cell is blocked)
    return (!cells[row-1][col-1])
    ? {
      row: row,
      col: col,
      orientation: orientation
    } : null

    //cells[currentY][currentX] != CellState.Blocked

  }


  /**
   * Start interval if game state switches to running
   */
  useEffect(() => {
    if (gameState === GameState.Running && intervalIdRef.current === -1) {
      intervalIdRef.current = setInterval(() => {
        calculateNextRound()
      }, 1000)
    }

    return () => {
      clearInterval(intervalIdRef.current)
      intervalIdRef.current = -1
    }
  }, [gameState])

  //console.log(robots)
  //console.log(selectedCell)

  console.log(cells)


  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {
          cells.map((row, i) =>
            row.map((cell, j) => {
              let robMove
              if (cell) {
                robMove = robots.find(move => move.robotId === cell)
                //if (robMove) return <Robot id={robMove.robotId} />
              } 
              return <Cell key={`[${i + 1}][${j + 1}]`} taken={cell != null} orientation={robMove && robMove.currentPosition.orientation} onCellSelected={(selected, row, col) => handleCellSelected(selected, row, col)} row={i+1} col={j+1} selected={selectedCell && i === selectedCell.row-1 && j === selectedCell.col-1 ? true : false} />
              //}
            }) 
          )
        }
      </div>
      {/*<Cockpit onInitRobot={({ startX, startY, direction, moves }) => {handleInitRobot({startX, startY, direction, moves})}}/>*/}
      <Cockpit gameState={gameState}
        selectedCell={selectedCell}
        onInitRobot={(direction, moves) => { handleInitRobot(direction, moves) }}
        onCancelInitRobot={() => { setGameState(GameState.Setup) }}
        onStart={() => {
          robotsInitialRef.current = robots
          setGameState(GameState.Running)
        }}
        onStop={() => { setGameState(GameState.Setup) }}
        onClear={() => {
          setRobots([])
          setCells(Array(height).fill(Array(width).fill(null)))
        }}
        onReset={() => {
          setRobots(robotsInitialRef.current)
          setCells(Array(height).fill(Array(width).fill(null)))
        }}/>
    </div>
  )
}

export default Grid