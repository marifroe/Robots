import styles from './Cell.module.css'

type CellProps = {
  onCellSelected: (selected: boolean, row: number, col: number) => void
  row: number
  col: number
  taken?: boolean
  orientation?: 'N' | 'O' | 'S' | 'W'
  selected: boolean
}

const Cell = (props: CellProps) => {
  
  const handleCellClick = () => {
    props.onCellSelected(!props.selected, props.row, props.col)
  }
  
  return (
    <button onClick={ handleCellClick } className={`${styles.cell} ${props.selected && styles.selected} ${props.taken && styles.robot}`}>
      {props.orientation && props.orientation}
    </button>
  )
}

export default Cell