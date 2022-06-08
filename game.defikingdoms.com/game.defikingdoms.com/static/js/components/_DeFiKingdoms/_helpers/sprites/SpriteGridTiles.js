import { Component } from 'react'
import PropTypes from 'prop-types'
import gridTileImage from './gridTile.png'

class GridTiles extends Component {
  constructor(props) {
    super(props)

    this.state = {
      visible: props.visible,
      cellSize: props.cellSize * props.diffRatio[0], // size of grid tiles,
      diffRatio: props.diffRatio,
      gridOffset: props.gridOffset,
      grid: Array(props.gridSize)
        .fill(0)
        .map(row => new Array(props.gridSize).fill(0))
    }
  }

  GridStyle() {
    return {
      opacity: '0.7',
      position: 'absolute',
      top: '0',
      left: '0',
      textAlign: 'center',
      width: '100%',
      height: '100%',
      zIndex: '300',
      imageRendering: '-moz-crisp-edges',
      imageRendering: 'pixelated'
    }
  }

  TextStyle() {
    return {
      position: 'absolute',
      top: '0px',
      left: '0px',
      zIndex: '500',
      fontSize: '5px'
    }
  }

  render() {
    return (
      <div>
        {this.state.visible &&
          this.state.grid.map((items, y) => {
            return (
              <div key={items.id}>
                {items.map((subItems, x) => {
                  const px = x * this.state.cellSize + this.state.gridOffset[0] * this.state.diffRatio[0]
                  const py = y * this.state.cellSize + this.state.gridOffset[1] * this.state.diffRatio[1]

                  const boxStyle = {
                    position: 'absolute',
                    top: `${py}px`,
                    left: `${px}px`,
                    width: `${this.state.cellSize}px`,
                    height: `${this.state.cellSize}px`
                  }

                  return (
                    <div key={subItems.id} style={boxStyle}>
                      <img style={this.GridStyle()} alt="test" src={gridTileImage} />
                      <div style={this.TextStyle()}>
                        {x},{y}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
      </div>
    )
  }
}

GridTiles.propTypes = {
  visible: PropTypes.bool,
  diffRatio: PropTypes.array,
  gridOffset: PropTypes.array,
  cellSize: PropTypes.number,
  gridSize: PropTypes.number
}

GridTiles.defaultProps = {
  visible: true,
  diffRatio: [1, 1],
  gridOffset: [0, 0],
  cellSize: 16,
  gridSize: 32
}

export default GridTiles
