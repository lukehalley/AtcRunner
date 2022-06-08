import { MouseEventHandler } from 'react'
import cx from 'classnames'
import frameClose from 'assets/images/gui/fancy_close.png'
import styles from './index.module.scss'

interface NPCDialogProps {
  npc: string
  description: string
  npcImage?: string
  longText?: boolean
  newProfile?: boolean
  showClose?: boolean
  handleDismissModal?: MouseEventHandler<HTMLButtonElement>
}

const NPCDialog = ({
  npc,
  npcImage,
  description,
  longText,
  newProfile,
  handleDismissModal,
  showClose
}: NPCDialogProps) => {
  return (
    <div
      className={cx(styles.npcDialog, {
        [styles.noImage]: !npcImage,
        [styles.longText]: longText,
        [styles.newProfile]: newProfile
      })}
    >
      {showClose && handleDismissModal && (
        <button className={styles.frameClose} onClick={handleDismissModal}>
          <img src={frameClose} alt="" />
        </button>
      )}
      <div className={styles.profileContainer}>
        {npcImage && (
          <img
            src={npcImage}
            style={{ bottom: npc.replace(/\s+/g, '').toLowerCase() === 'quarrysmithgren' ? -61 : 0 }}
            className={styles.profileImage}
          />
        )}
      </div>
      <div className={styles.npcText}>
        <h4 className={styles.npcName}>
          <span>{npc}</span>
        </h4>
        <p dangerouslySetInnerHTML={{ __html: description }} />
      </div>
    </div>
  )
}

export default NPCDialog
