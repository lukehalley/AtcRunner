import { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

class SpriteStatic extends Component {
  constructor(props) {
    super(props)

    this.state = {
      diffRatio: props.diffRatio,
      sprite: props.sprite,
      frameSize: props.frameSize, // the size of a single frame on the sheet
      gridOffset: [0, 0],
      cellSize: props.cellSize * props.diffRatio[0], // size of grid tiles
      flip: props.flip,
      spriteOffset: [props.spriteOffset[0] * props.diffRatio[0], props.spriteOffset[1] * props.diffRatio[1]],
      position: props.position,
      zOffset: props.zOffset
    }

    this.Sprite = styled.img``
  }

  SpriteStyle() {
    const scaleX = this.state.flip[0] ? -1 : 1
    const scaleY = this.state.flip[1] ? -1 : 1
    return {
      position: 'absolute',
      width: `${this.state.frameSize[0] * this.state.diffRatio[0]}px`,
      height: `${this.state.frameSize[1] * this.state.diffRatio[1]}px`,
      imageRendering: '-moz-crisp-edges',
      imageRendering: 'pixelated',
      transform: `scale(${scaleX},${scaleY})`
    }
  }

  SpriteDivStyle() {
    return {
      position: 'absolute',
      width: `${Math.floor(this.state.frameSize[0] * this.state.diffRatio[0])}px`,
      height: `${Math.floor(this.state.frameSize[1] * this.state.diffRatio[1])}px`,
      top: `${this.state.position[1] * this.state.cellSize - this.state.spriteOffset[1] + this.state.gridOffset[1]}px`,
      left: `${this.state.position[0] * this.state.cellSize - this.state.spriteOffset[0] + this.state.gridOffset[0]}px`,
      overflow: 'hidden',
      display: 'flex',
      padding: 0,
      border: 0,
      backgroundColor: 'transparent',
      zIndex: `${Math.floor((this.state.position[1] + 1) * this.state.cellSize) - 1 + this.state.zOffset}`
    }
  }

  render() {
    const Component = this.props.onClick ? 'button' : 'div'
    return (
      <div>
        <Component style={this.SpriteDivStyle()} onClick={this.props.onClick}>
          <this.Sprite src={this.state.sprite} style={this.SpriteStyle()} />
        </Component>
      </div>
    )
  }
}

SpriteStatic.propTypes = {
  diffRatio: PropTypes.array,
  sprite: PropTypes.string,
  frameSize: PropTypes.array,
  gridOffset: PropTypes.array,
  cellSize: PropTypes.number,
  flip: PropTypes.arrayOf(Boolean),
  spriteOffset: PropTypes.array,
  position: PropTypes.array,
  zOffset: PropTypes.number,
  onClick: PropTypes.func
}

SpriteStatic.defaultProps = {
  diffRatio: [1, 1],
  gridOffset: [0, 0],
  cellSize: 16,
  flip: [false, false],
  spriteOffset: [0, 0],
  position: [3, 3],
  zOffset: 0
}

export default SpriteStatic
