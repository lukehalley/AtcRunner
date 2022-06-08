import { PlayCircle } from 'react-feather'
import { MouseoverTooltip } from 'components/Tooltip'
import { setShowModal } from 'features/cutscenes/state'
import { useDispatch, useSelector } from 'features/hooks'
import styles from './index.module.scss'

const PlayCutsceneButton = () => {
  const { hasCutscene } = useSelector(s => s.cutscenes)
  const dispatch = useDispatch()
  function handleClick() {
    dispatch(setShowModal(true))
  }
  if (hasCutscene) {
    return (
      <MouseoverTooltip text="Replay Cinematic">
        <button className={styles.button} onClick={handleClick}>
          <PlayCircle color="white" />
        </button>
      </MouseoverTooltip>
    )
  }
  return null
}

export default PlayCutsceneButton
