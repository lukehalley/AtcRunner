import cx from 'classnames'
import styles from './index.module.scss'

export default function Loader({
  className,
  size = '16px',
  stroke,
  style,
  ...rest
}: {
  className?: string
  size?: string
  stroke?: string
  style?: React.CSSProperties
  [k: string]: any
}) {
  return (
    <svg
      className={cx(styles.loader, className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ ...style, width: size, height: size }}
      stroke={stroke}
      {...rest}
    >
      <path
        style={{ stroke: stroke || '#14c25a' }}
        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
