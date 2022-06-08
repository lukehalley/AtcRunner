import { isMobile } from 'react-device-detect'
import { animated, useTransition } from 'react-spring'
import { DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import { useSelector } from 'features/hooks'
import { getClickCursor, getDefaultCursor } from 'features/preferences/utils'
import { transparentize } from 'polished'
import styled, { css } from 'styled-components'

interface ModalProps {
  isOpen: boolean
  onDismiss: () => void
  minHeight?: number | false
  maxHeight?: number
  maxWidth?: number
  initialFocusRef?: React.RefObject<any>
  children?: React.ReactNode
  className?: string
  overlayClassName?: string
}

export default function Modal({
  isOpen,
  onDismiss,
  minHeight = false,
  maxHeight = 90,
  maxWidth = 420,
  initialFocusRef,
  className,
  overlayClassName,
  children
}: ModalProps) {
  const { customCursor } = useSelector(s => s.preferences)
  const fadeTransition = useTransition(isOpen, {
    config: { duration: 200 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
  })

  return (
    <>
      {fadeTransition(
        (springs, item) =>
          item && (
            <StyledDialogOverlay
              style={springs}
              onDismiss={onDismiss}
              initialFocusRef={initialFocusRef}
              customCursor={customCursor}
              dangerouslyBypassScrollLock
              className={overlayClassName}
            >
              <StyledDialogContent
                aria-label="dialog content"
                minHeight={minHeight}
                maxHeight={maxHeight}
                maxWidth={maxWidth}
                mobile={isMobile}
                className={className}
              >
                {/* prevents the automatic focusing of inputs on mobile by the reach dialog */}
                {!initialFocusRef && isMobile ? <div tabIndex={1} /> : null}
                {children}
              </StyledDialogContent>
            </StyledDialogOverlay>
          )
      )}
    </>
  )
}

const AnimatedDialogOverlay = animated(DialogOverlay)
const StyledDialogOverlay = styled(({ customCursor, ...rest }) => <AnimatedDialogOverlay {...rest} />)`
  cursor: ${({ customCursor }) => (customCursor ? `url(${getDefaultCursor()}), auto !important` : 'auto')};

  &[data-reach-dialog-overlay] {
    z-index: 200;
    background-color: transparent;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${({ theme }) => theme.modalBG};
  }

  a,
  button {
    &:not(:disabled) {
      cursor: ${({ customCursor }) => (customCursor ? `url(${getClickCursor()}), auto !important` : 'pointer')};
    }
  }

  label {
    cursor: ${({ customCursor }) => (customCursor ? `url(${getClickCursor()}), auto !important` : 'pointer')};
  }
`

const AnimatedDialogContent = animated(DialogContent)
const StyledDialogContent = styled(({ minHeight, maxHeight, mobile, isOpen, maxWidth, ...rest }) => (
  <AnimatedDialogContent {...rest} />
)).attrs({
  'aria-label': 'dialog',
  className: 'modal-overlay'
})`
  overflow-y: ${({ mobile }) => (mobile ? 'scroll' : 'hidden')};

  &[data-reach-dialog-content] {
    margin: auto;
    background-color: ${({ theme }) => theme.bg0};
    box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(0.95, theme.shadow1)};
    padding: 0px;
    width: 95vw;
    overflow-y: auto;
    overflow-x: hidden;
    align-self: ${({ mobile }) => (mobile ? 'flex-end' : 'center')};

    ${({ maxHeight }) =>
      maxHeight &&
      css`
        max-height: ${maxHeight}vh;
      `}
    ${({ minHeight }) =>
      minHeight &&
      css`
        min-height: ${minHeight}vh;
      `}
    ${({ maxWidth }) =>
      maxWidth &&
      css`
        max-width: ${maxWidth}px;
      `}
    display: flex;
    border-radius: 0;
    ${({ theme }) => theme.mediaWidth.upToMedium`
      width: 90vw;
      margin: 0;
    `}
    ${({ theme, mobile }) => theme.mediaWidth.upToSmall`
      ${
        mobile &&
        css`
          width: 100vw;
          border-radius: 0;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        `
      }
    `}
  }
`
