import { MouseEventHandler } from 'react'
import { QuestProviderStatus } from 'features/quests/types'
import styled from 'styled-components'
import styles from './SpriteBubble.module.scss'
import SpriteBubbleIcon from './SpriteBubbleIcon'

interface SpriteBubbleProps {
  diffRatio: number[]
  positioning: { top: number; left: number }
  text: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  status?: QuestProviderStatus
}

const SpriteBubble = ({ diffRatio, onClick, positioning, status, text }: SpriteBubbleProps) => {
  return (
    <BubblePositioning diffRatio={diffRatio} positioning={positioning} onClick={onClick}>
      <SpriteBubbleStyled className={styles.spriteBubble} diffRatio={diffRatio}>
        <span>
          <SpriteBubbleIcon diffRatio={diffRatio} status={status} />
          {text}
        </span>
        <SpriteArrow className={styles.spriteArrow} diffRatio={diffRatio} />
      </SpriteBubbleStyled>
    </BubblePositioning>
  )
}

const baseWidth = 32.5
const baseHeight = 20

const BubblePositioning = styled.button<{
  diffRatio: number[]
  positioning: { top: number; left: number }
}>`
  position: absolute;
  top: ${({ positioning, diffRatio }) => `${positioning ? positioning.top * diffRatio[1] : 0}px`};
  left: ${({ positioning, diffRatio }) => `${positioning ? positioning.left * diffRatio[0] : 0}px`};
  padding: 0;
  border: 0;
  background-color: transparent;
  outline: 0;
`

const SpriteBubbleStyled = styled.div<{ diffRatio: number[] }>`
  height: ${({ diffRatio }) => `${baseHeight * diffRatio[1]}px`};
  padding: ${({ diffRatio }) => `0 ${4 * diffRatio[0]}px`};

  span {
    font-size: ${({ diffRatio }) => `${8 * diffRatio[0]}px`};
  }

  &:before {
    width: ${({ diffRatio }) => `calc(100% + ${baseWidth * diffRatio[0]}px)`};
    left: ${({ diffRatio }) => `-${(baseWidth / 2) * diffRatio[0]}px`};
    background-size: ${({ diffRatio }) => `${baseWidth * diffRatio[0]}px ${baseHeight * diffRatio[1]}px`};
  }

  &:after {
    background-size: ${({ diffRatio }) => `${2 * diffRatio[0]}px ${baseHeight * diffRatio[1]}px`};
  }
`

const SpriteArrow = styled.div<{ diffRatio: number[] }>`
  top: ${({ diffRatio }) => `calc(100% - ${2 * diffRatio[1]}px)`};
  width: ${({ diffRatio }) => `${10 * diffRatio[0]}px`};
  height: ${({ diffRatio }) => `${7 * diffRatio[1]}px`};
  background-size: ${({ diffRatio }) => `${10 * diffRatio[0]}px ${7 * diffRatio[1]}px`};
`

export default SpriteBubble
