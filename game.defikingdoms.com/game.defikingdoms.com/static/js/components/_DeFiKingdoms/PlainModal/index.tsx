import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import cx from 'classnames'
import { useBlockPropagationTrigger } from 'components/Phaser/utils'
import { useSelector } from 'features/hooks'
import FocusTrap from 'focus-trap-react'
import { CloseIcon } from 'theme/components'
import styles from './index.module.scss'

interface PlainModalProps {
  children?: React.ReactNode
  className?: string
  closeModal: Function
  contentClassName?: string
  modalClassName?: string
  disableTrap?: boolean
  hideClose?: boolean
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  showModal: boolean
  title?: string
  wrapperClassName?: string
}

const PlainModal = ({
  children,
  className,
  closeModal,
  contentClassName,
  disableTrap,
  hideClose,
  maxWidth,
  minHeight,
  maxHeight,
  modalClassName,
  showModal,
  title,
  wrapperClassName
}: PlainModalProps) => {
  useBlockPropagationTrigger('.plain-modal-blocker', showModal)
  const modalRef = useRef<any>(null)
  const [fadeOut, setFadeOut] = useState(false)
  const { customCursor } = useSelector(s => s.preferences)

  useEffect(() => {
    document.addEventListener('keydown', escapeFunction, false)

    return () => {
      document.removeEventListener('keydown', escapeFunction, false)
    }
  }, [])

  const handleDismissModal = () => {
    setFadeOut(true)
    setTimeout(() => {
      closeModal()
      setFadeOut(false)
    }, 400)
  }

  function escapeFunction(ev: any) {
    if (ev.key === 'Escape') {
      handleDismissModal()
    }
  }

  return typeof document !== 'undefined' && showModal
    ? createPortal(
        <FocusTrap active={!disableTrap}>
          <div
            className={cx('plain-modal-blocker', styles.modalWrapper, className, {
              [styles.fadeOut]: fadeOut,
              [styles.customCursor]: customCursor
            })}
          >
            <div className={cx(styles.contentWrapper, wrapperClassName)} ref={modalRef}>
              <section
                className={cx(styles.plainModal, modalClassName)}
                style={{ maxWidth, minHeight: `${minHeight}vh`, maxHeight: `${maxHeight}vh` }}
              >
                {title && (
                  <header>
                    <h4>{title}</h4>
                    {!hideClose && (
                      <button className={styles.closeIcon} onClick={handleDismissModal}>
                        <CloseIcon />
                      </button>
                    )}
                  </header>
                )}
                <div className={cx(styles.plainContent, contentClassName)}>{children}</div>
              </section>
            </div>
            <div className={styles.plainOverlay} onClick={handleDismissModal} />
          </div>
        </FocusTrap>,
        document.body
      )
    : null
}

export default PlainModal
