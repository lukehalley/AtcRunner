import { MouseEventHandler, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft } from 'react-feather'
import cx from 'classnames'
import { useBlockPropagationTrigger } from 'components/Phaser/utils'
import { useSelector } from 'features/hooks'
import FocusTrap from 'focus-trap-react'
import { CloseIcon } from 'theme/components'
import frameClose from 'assets/images/gui/fancy_close.png'
import frameCloseParchment from 'assets/images/gui/parchment-modal/seal_exit_button_2x.png'
import styles from './index.module.scss'

interface FancyModalProps {
  closeModal: Function
  showModal: boolean
  children?: React.ReactNode
  appendComponent?: React.ReactNode
  backArrowClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
  contentClassName?: string
  heightTrigger?: any
  hideClose?: boolean
  hideOverlay?: boolean
  modalStyle?: 'plain' | 'parchment'
  prependComponent?: React.ReactNode
  showBackArrow?: boolean
  showTitle?: boolean
  title?: string
  wrapperClassName?: string
  disableTrap?: boolean
  clearOverlay?: boolean
}

const FancyModal = ({
  appendComponent,
  prependComponent,
  backArrowClick,
  children,
  className,
  closeModal,
  contentClassName,
  heightTrigger,
  hideClose,
  hideOverlay,
  modalStyle,
  showBackArrow,
  showModal,
  showTitle,
  title,
  wrapperClassName,
  disableTrap,
  clearOverlay
}: FancyModalProps) => {
  useBlockPropagationTrigger('.fancy-modal-blocker', showModal)
  const modalRef = useRef<any>(null)
  const [fadeOut, setFadeOut] = useState(false)
  const { customCursor } = useSelector(s => s.preferences)
  const [isModalTallerThanWindow, setIsModalTallerThanWindow] = useState(true)
  const checkHeight = () => {
    if (modalRef.current) {
      const padding = 120
      const tallerThanWindow = modalRef.current?.clientHeight + padding >= window.innerHeight
      setIsModalTallerThanWindow(tallerThanWindow)
    }
  }

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

  useEffect(() => {
    window.addEventListener('resize', checkHeight)
    document.addEventListener('keydown', escapeFunction, false)

    return () => {
      window.removeEventListener('resize', checkHeight)
      document.removeEventListener('keydown', escapeFunction, false)
    }
  }, [])

  useEffect(() => {
    setTimeout(() => {
      checkHeight()
    }, 50)
  }, [showModal])

  useEffect(() => {
    checkHeight()
  }, [heightTrigger])

  let closeIconImage = frameClose
  if (modalStyle === 'parchment') {
    closeIconImage = frameCloseParchment
  }

  return typeof document !== 'undefined' && showModal
    ? createPortal(
        <FocusTrap active={!disableTrap}>
          <div
            className={cx('fancy-modal-blocker', styles.modalWrapper, className, {
              [styles.fadeOut]: fadeOut,
              [styles.heightAdjust]: isModalTallerThanWindow,
              [styles.plainModal]: modalStyle === 'plain',
              [styles.parchmentModal]: modalStyle === 'parchment',
              [styles.customCursor]: customCursor
            })}
          >
            <div className={cx(styles.contentWrapper, wrapperClassName)} ref={modalRef}>
              {prependComponent}
              <div className={cx(styles.fancyModal, contentClassName)}>
                {showBackArrow && (
                  <button
                    className={styles.backArrow}
                    onClick={typeof backArrowClick !== 'undefined' ? backArrowClick : handleDismissModal}
                  >
                    <ArrowLeft size="28" />
                  </button>
                )}
                {modalStyle === 'plain' && !hideClose && (
                  <button className={styles.closeIcon} onClick={handleDismissModal}>
                    <CloseIcon />
                  </button>
                )}
                {modalStyle !== 'plain' && !hideClose && (
                  <button className={styles.frameClose} onClick={handleDismissModal}>
                    <img src={closeIconImage} alt="" />
                  </button>
                )}
                {modalStyle !== 'plain' && showTitle && (
                  <div className={styles.fancyTitleContainer}>
                    <h2 className={styles.fancyTitle}>
                      <span>{title}</span>
                    </h2>
                  </div>
                )}
                <div className={styles.fancyContent}>{children}</div>
              </div>
              {appendComponent}
            </div>
            {!hideOverlay && (
              <div
                className={styles.fancyOverlay}
                style={clearOverlay ? { backgroundColor: 'transparent' } : {}}
                onClick={handleDismissModal}
              />
            )}
          </div>
        </FocusTrap>,
        document.body
      )
    : null
}

export default FancyModal
