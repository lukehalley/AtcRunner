import { MouseEventHandler } from 'react'
import FancyModal from 'components/_DeFiKingdoms/FancyModal'
import NPCDialog from 'components/_DeFiKingdoms/NPCDialog'
import styles from './index.module.scss'

interface NPCSimpleModalProps {
  npcName: string
  description: string
  showModal: boolean
  dismissModal: MouseEventHandler<HTMLButtonElement>
  npcImage?: string
  longText?: boolean
  newProfile?: boolean
}

const NPCSimpleModal = ({
  dismissModal,
  npcName,
  npcImage,
  description,
  longText,
  newProfile,
  showModal
}: NPCSimpleModalProps) => {
  return (
    <FancyModal
      className={styles.npcSimpleModal}
      wrapperClassName={styles.npcSimpleWrapper}
      contentClassName={styles.npcSimpleContent}
      appendComponent={
        <NPCDialog
          npc={npcName}
          npcImage={npcImage}
          description={description}
          longText={longText}
          newProfile={newProfile}
          handleDismissModal={dismissModal}
          showClose
        />
      }
      closeModal={dismissModal}
      showModal={showModal}
      modalStyle="plain"
      disableTrap
    />
  )
}

export default NPCSimpleModal
