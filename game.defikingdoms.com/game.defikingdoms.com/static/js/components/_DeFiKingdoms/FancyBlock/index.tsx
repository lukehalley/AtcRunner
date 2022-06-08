import { MouseEventHandler } from 'react'
import cx from 'classnames'
import { useSelector } from 'features/hooks'
import styles from './index.module.scss'

interface FancyBlockProps {
  children?: React.ReactNode
  className?: string
  focusable?: boolean
  hoverEffect?: boolean
  tabIndex?: number
  blockStyle?: 'parchment'
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLDivElement>
}

const FancyBlock = ({
  children,
  className,
  focusable,
  hoverEffect,
  tabIndex,
  blockStyle,
  onClick
}: FancyBlockProps) => {
  const { customCursor } = useSelector(s => s.preferences)
  const As = focusable ? 'button' : 'div'
  return (
    <As
      className={cx(styles.fancyBlock, className, {
        [styles.hoverEffect]: hoverEffect,
        [styles.parchmentBlock]: blockStyle === 'parchment',
        [styles.customCursor]: customCursor
      })}
      onClick={onClick}
      tabIndex={tabIndex}
    >
      {children}
    </As>
  )
}

export default FancyBlock
