import styled, { keyframes } from 'styled-components'
import jewelIcon from 'assets/images/mid-jewel.png'

const rotateAnim = keyframes`
    from {
        transform: rotate(0deg);
    }
    80% {
        transform: rotate(359deg);
    }
    to {
        transform: rotate(359deg);
    }
`

const LoadingScreen = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 64px;
    image-rendering: -moz-crisp-edges;
    image-rendering: pixelated;
    animation: ${rotateAnim} 2s infinite ease-out;
  }
`

const JewelLoader = () => {
  return (
    <LoadingScreen>
      <img src={jewelIcon} />
    </LoadingScreen>
  )
}

export default JewelLoader
