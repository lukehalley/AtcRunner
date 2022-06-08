import { CSSProperties } from 'react'
import cx from 'classnames'
import Modal from 'components/Modal'
import { CloseIcon } from 'theme/components'

interface DKModalProps {
  className?: string
  showModal: any
  setShowModal: any
  title: string
  children: any
  maxWidth: number
  onClose?: Function
  isScrollable?: boolean
  headerStyle?: CSSProperties
  bodyStyle?: CSSProperties
}

export const DKModal = ({
  className,
  children,
  showModal,
  setShowModal,
  title,
  maxWidth,
  onClose,
  isScrollable = true,
  headerStyle,
  bodyStyle
}: DKModalProps) => {
  const handleOnDismiss = () => {
    setShowModal(false)
    onClose && onClose()
  }

  return (
    <Modal isOpen={showModal} onDismiss={handleOnDismiss} maxWidth={maxWidth} className={cx('dk-modal', { className })}>
      <div className="dk-modal--header">
        <h4 style={headerStyle}>{title}</h4>
        <CloseIcon onClick={handleOnDismiss} />
      </div>
      <div className={cx('dk-modal--body', { scrollable: isScrollable })} style={bodyStyle || {}}>
        {children}
      </div>
    </Modal>
  )
}
