type RobotProps = {
  id: number
  move?: Move
  rangeX?: number
  rangeY?: number
  canMove?: boolean
  requestNextMove?: (coord: {x: number, y: number}) => void
}

export type Move = {
  row: number
  col: number
  direction: 'N' | 'O' | 'S' | 'W'
  moves: ('R' | 'L' | 'V')[]
}

const Robot = (props: RobotProps) => {

  const moveRobot = (move: Move) => {
    let currentDirection = move.direction
    let currentX = move.row
    let currentY = move.col

    move.moves.forEach((m) => {
      switch (m) {
        case 'L':
          if (currentDirection === 'N') currentDirection = 'W'
          else if (currentDirection === 'O') currentDirection = 'N'
          else if (currentDirection === 'S') currentDirection = 'O'
          else if (currentDirection === 'W') currentDirection = 'S'
          break
        case 'R':
          if (currentDirection === 'N') currentDirection = 'O'
          else if (currentDirection === 'O') currentDirection = 'S'
          else if (currentDirection === 'S') currentDirection = 'W'
          else if (currentDirection === 'W') currentDirection = 'N'
          break
        case 'V':
          if (currentDirection === 'N') currentY += 1
          else if (currentDirection === 'O') currentX += 1
          else if (currentDirection === 'S') currentY -= 1
          else if (currentDirection === 'W') currentX -= 1
          if (currentX === props.rangeX && currentDirection === 'O') currentDirection = 'W'
          if (currentX === 0 && currentDirection === 'W') currentDirection = 'O'
          if (currentY === props.rangeY && currentDirection === 'N') currentDirection = 'S'
          if (currentY === 0 && currentDirection === 'S') currentDirection = 'N'
          break
      }
    })

    console.log(`position x: ${currentX}, position y: ${currentY}, direction: ${currentDirection}`)
  }

  //moveRobot(props.move)

  return (
    <div></div>
  )
}

export default Robot