import cx from 'classnames'
import styles from './index.module.scss'

interface FancyContainerProps {
  children: React.ReactNode
  className?: string
}

const FancyContainer = ({ children, className }: FancyContainerProps) => {
  return (
    <div className={cx(styles.fancyContainer, className)}>
      <div className={styles.fancyContent}>{children}</div>
    </div>
  )
}

export default FancyContainer
