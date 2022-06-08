import { ChangeEventHandler, useEffect, useState } from 'react'
import { VolumeX, Volume2 } from 'react-feather'
import cx from 'classnames'
import { useBlockPropagation } from 'components/Phaser/utils'
import { setMuted, setVolume, setFXMuted, setFXVolume } from 'features/audio/state'
import { useDispatch, useSelector } from 'features/hooks'
import styled from 'styled-components'
import { MouseoverTooltip } from '../../Tooltip'
import musicOn from './images/music-regular.svg'
import musicOff from './images/music-slash-regular.svg'
import styles from './index.module.scss'

const VolumeControl: React.FC = () => {
  useBlockPropagation('.volume-wrapper')
  const [isHovered, setIsHovered] = useState(false)
  const dispatch = useDispatch()
  const [isHoveredEffects, setIsHoveredEffects] = useState(false)
  const attribution = 'DeFi Kingdoms Original Soundtrack'
  const { volume, muted, fxVolume, fxMuted } = useSelector(s => s.audio)
  const { customCursor } = useSelector(s => s.preferences)

  useEffect(() => {
    localStorage.setItem('defiKingdoms_audioSettings', JSON.stringify({ volume, muted, fxVolume, fxMuted }))
  }, [volume, muted, fxVolume, fxMuted])

  const handleMutedChange = (muted: boolean) => {
    dispatch(setMuted(muted))
  }

  const handleVolumeChange: ChangeEventHandler<HTMLInputElement> = event => {
    dispatch(setVolume(parseFloat(event.target.value)))
  }

  const handleEffectsMutedChange = (muted: boolean) => {
    dispatch(setFXMuted(muted))
  }

  const handleEffectsVolumeChange: ChangeEventHandler<HTMLInputElement> = event => {
    dispatch(setFXVolume(parseFloat(event.target.value)))
  }

  return (
    <div className={styles.volumeControl}>
      <div
        className={cx(styles.wrapper, {
          [styles.customCursor]: customCursor
        })}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <MouseoverTooltip text={attribution}>
          <MuteButton onClick={() => handleMutedChange(!muted)}>
            {muted ? (
              <img className="muted-music" src={musicOff} alt="Music muted" />
            ) : (
              <img src={musicOn} alt="Music on" />
            )}
          </MuteButton>
        </MouseoverTooltip>
        {isHovered && (
          <div className={styles.volume}>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.025"
              value={`${muted ? 0.0 : volume}`}
              onChange={handleVolumeChange}
            />
          </div>
        )}
      </div>
      <div
        className={cx(styles.wrapper, {
          [styles.customCursor]: customCursor
        })}
        onMouseEnter={() => setIsHoveredEffects(true)}
        onMouseLeave={() => setIsHoveredEffects(false)}
      >
        <MuteButton onClick={() => handleEffectsMutedChange(!fxMuted)}>
          {fxMuted ? <VolumeX /> : <Volume2 />}
        </MuteButton>
        {isHoveredEffects && (
          <div className={styles.volume}>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.025"
              value={`${fxMuted ? 0.0 : fxVolume}`}
              onChange={handleEffectsVolumeChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default VolumeControl

const MuteButton = styled.div.attrs(props => ({
  className: 'mute-wrapper'
}))`
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  border-radius: 10px;

  img {
    width: 20px;

    &.muted-music {
      width: 24px;
    }
  }

  &:hover {
    background: rgba(0, 0, 0, 0.25);
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 50px;
    height: 50px;
  `};
`
