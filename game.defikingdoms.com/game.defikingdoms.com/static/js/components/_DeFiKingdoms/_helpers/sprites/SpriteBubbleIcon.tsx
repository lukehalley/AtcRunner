import { faExclamationCircle, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { QuestProviderStatus } from 'features/quests/types'

interface SpriteIconProps {
  diffRatio: number[]
  status?: QuestProviderStatus
}

const SpriteIcon = ({ diffRatio, status }: SpriteIconProps) => {
  const iconSize = 7 * diffRatio[0]

  return (
    <>
      {status === QuestProviderStatus.Pending ? (
        <span style={{ fontSize: iconSize, marginRight: `${2 * diffRatio[0]}px` }}>
          <FontAwesomeIcon icon={faCircleNotch} style={{ opacity: '75%' }} spin />
        </span>
      ) : status === QuestProviderStatus.Complete ? (
        <span style={{ fontSize: iconSize, marginRight: `${2 * diffRatio[0]}px` }}>
          <FontAwesomeIcon icon={faExclamationCircle} style={{ opacity: '75%' }} />
        </span>
      ) : null}
    </>
  )
}

export default SpriteIcon
