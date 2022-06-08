import { Component } from 'react'
import PropTypes from 'prop-types'
import styled, { keyframes, css } from 'styled-components'
import Events from './SpriteEventBus'

class SpriteDynamic extends Component {
  constructor(props) {
    super(props)

    this.state = {
      diffRatio: props.diffRatio,
      spriteSheet: props.spriteSheet,
      sheetSize: props.sheetSize, // the size of the sprite sheet
      frameSize: props.frameSize, // the size of a single frame on the sheet
      frameStarts: props.frameStarts, // the index for the first frame in each animation [idle, walkSide, walkDown, walkUp, interact]
      frameCounts: props.frameCounts, // number of frames for each animation [idle, walkSide, walkDown, walkUp, interact]
      animationSpeeds: props.animationSpeeds, // how fast the animations play (seconds) [idle, walkSide, walkDown, walkUp, interact]
      animationLoops: props.animationLoops,
      gridOffset: [0, 0],
      cellSize: props.cellSize * props.diffRatio[0], // size of grid tiles
      spriteOffset: [props.spriteOffset[0] * props.diffRatio[0], props.spriteOffset[1] * props.diffRatio[1]],
      position: props.position,
      animationState: 0,
      flip: props.flip,
      event: props.event,
      autoCycle: props.autoCycle,
      zOffset: props.zOffset
    }

    const keyIdle = keyframes`
      from { left: -${this.state.frameSize[0] * this.state.frameStarts[0] * this.state.diffRatio[0]}px; }
      to { left: -${
        this.state.frameSize[0] * (this.state.frameStarts[0] + this.state.frameCounts[0]) * this.state.diffRatio[0]
      }px; }
    `

    const keyState1 = keyframes`
      from { left: -${this.state.frameSize[0] * this.state.frameStarts[1] * this.state.diffRatio[0]}px; }
      to { left: -${
        this.state.frameSize[0] * (this.state.frameStarts[1] + this.state.frameCounts[1]) * this.state.diffRatio[0]
      }px; }
    `

    const keyState2 = keyframes`
      from { left: -${this.state.frameSize[0] * this.state.frameStarts[2] * this.state.diffRatio[0]}px; }
      to { left: -${
        this.state.frameSize[0] * (this.state.frameStarts[2] + this.state.frameCounts[2]) * this.state.diffRatio[0]
      }px; }
    `

    const keyState3 = keyframes`
      from { left: -${this.state.frameSize[0] * this.state.frameStarts[3] * this.state.diffRatio[0]}px; }
      to { left: -${
        this.state.frameSize[0] * (this.state.frameStarts[3] + this.state.frameCounts[3]) * this.state.diffRatio[0]
      }px; }
    `

    const keyState4 = keyframes`
      from { left: -${this.state.frameSize[0] * this.state.frameStarts[4] * this.state.diffRatio[0]}px; }
      to { left: -${
        this.state.frameSize[0] * (this.state.frameStarts[4] + this.state.frameCounts[4]) * this.state.diffRatio[0]
      }px; }
    `

    const keyState5 = keyframes`
      from { left: -${this.state.frameSize[0] * this.state.frameStarts[5] * this.state.diffRatio[0]}px; }
      to { left: -${
        this.state.frameSize[0] * (this.state.frameStarts[5] + this.state.frameCounts[5]) * this.state.diffRatio[0]
      }px; }
    `

    const styleIdle = css`
      ${keyIdle} ${this.state.animationSpeeds[0]}s steps(${this.state.frameCounts[0]}) infinite;
    `

    const styleState1 = css`
      ${keyState1} ${this.state.animationSpeeds[1]}s steps(${this.state.frameCounts[1]}) infinite;
    `

    const styleState2 = css`
      ${keyState2} ${this.state.animationSpeeds[2]}s steps(${this.state.frameCounts[2]}) infinite;
    `

    const styleState3 = css`
      ${keyState3} ${this.state.animationSpeeds[3]}s steps(${this.state.frameCounts[3]}) infinite;
    `

    const styleState4 = css`
      ${keyState4} ${this.state.animationSpeeds[4]}s steps(${this.state.frameCounts[4]}) infinite;
    `

    const styleState5 = css`
      ${keyState5} ${this.state.animationSpeeds[5]}s steps(${this.state.frameCounts[5]}) infinite;
    `

    this.StateIdle = styled.img`
      animation: ${styleIdle};
    `

    this.State1 = styled.img`
      animation: ${styleState1};
    `

    this.State2 = styled.img`
      animation: ${styleState2};
    `

    this.State3 = styled.img`
      animation: ${styleState3};
    `

    this.State4 = styled.img`
      animation: ${styleState4};
    `

    this.State5 = styled.img`
      animation: ${styleState5};
    `
  }

  componentDidMount() {
    if (this.state.event.length > 0) {
      Events.on(this.state.event, data => {
        this.setState({
          animationState: data.state
        })
      })
    }

    if (this.state.autoCycle) {
      this.cycle = setInterval(() => this.NextInCycle(), this.state.animationSpeeds[this.state.animationState] * 1000)
    }
  }

  componentWillUnmount() {
    if (this.state.event.length > 0) {
      Events.remove(this.state.event)
    }

    if (this.state.autoCycle) {
      clearInterval(this.cycle)
    }
  }

  NextInCycle() {
    clearInterval(this.cycle)

    let next = this.state.animationState + 1

    if (next >= this.state.frameCounts.length) {
      next = 0
    }

    this.setState({
      animationState: next
    })

    this.cycle = setInterval(() => this.NextInCycle(), this.state.animationSpeeds[next] * 1000)
  }

  SpriteStyle() {
    const scaleX = this.state.flip[0] ? -1 : 1
    const scaleY = this.state.flip[1] ? -1 : 1
    return {
      position: 'absolute',
      width: `${this.state.sheetSize[0] * this.state.diffRatio[0]}px`,
      height: `${this.state.sheetSize[1] * this.state.diffRatio[1]}px`,
      imageRendering: '-moz-crisp-edges',
      imageRendering: 'pixelated',
      transform: `scale(${scaleX}, ${scaleY})`
    }
  }

  SpriteDivStyle() {
    return {
      position: 'absolute',
      width: `${this.state.frameSize[0] * this.state.diffRatio[0]}px`,
      height: `${this.state.frameSize[1] * this.state.diffRatio[1]}px`,
      top: `${this.state.position[1] * this.state.cellSize + this.state.gridOffset[1] - this.state.spriteOffset[1]}px`,
      left: `${this.state.position[0] * this.state.cellSize + this.state.gridOffset[0] - this.state.spriteOffset[0]}px`,
      overflow: 'hidden',
      zIndex: `${Math.floor((this.state.position[1] + 1) * this.state.cellSize) - 1 + this.state.zOffset}`
    }
  }

  GetState() {
    switch (this.state.animationState) {
      case 1:
        return <this.State1 src={this.state.spriteSheet} style={this.SpriteStyle()} />
      case 2:
        return <this.State2 src={this.state.spriteSheet} style={this.SpriteStyle()} />
      case 3:
        return <this.State3 src={this.state.spriteSheet} style={this.SpriteStyle()} />
      case 4:
        return <this.State4 src={this.state.spriteSheet} style={this.SpriteStyle()} />
      case 5:
        return <this.State5 src={this.state.spriteSheet} style={this.SpriteStyle()} />

      default:
        return <this.StateIdle src={this.state.spriteSheet} style={this.SpriteStyle()} />
    }
  }

  render() {
    return (
      <div>
        <div style={this.SpriteDivStyle()} className={this.props.className}>
          {(() => {
            return this.GetState()
          })()}
        </div>
      </div>
    )
  }
}

SpriteDynamic.propTypes = {
  className: PropTypes.string,
  diffRatio: PropTypes.array,
  spriteSheet: PropTypes.string,
  sheetSize: PropTypes.array,
  frameSize: PropTypes.array,
  frameStarts: PropTypes.array,
  frameCounts: PropTypes.array,
  animationSpeeds: PropTypes.array,
  animationLoops: PropTypes.array,
  cellSize: PropTypes.number,
  spriteOffset: PropTypes.array,
  position: PropTypes.array,
  flip: PropTypes.arrayOf(Boolean),
  event: PropTypes.string,
  autoCycle: PropTypes.bool,
  zOffset: PropTypes.number
}

SpriteDynamic.defaultProps = {
  diffRatio: [1, 1],
  gridOffset: [0, 0],
  cellSize: 16,
  animationLoops: [1],
  spriteOffset: [0, 0],
  position: [3, 3],
  flip: [false, false],
  event: '',
  autoCycle: false,
  zOffset: 0
}

export default SpriteDynamic
