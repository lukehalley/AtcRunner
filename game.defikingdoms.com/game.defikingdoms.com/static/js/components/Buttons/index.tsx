import { CSSProperties, MouseEventHandler } from 'react'
import { Link } from 'react-router-dom'
import cx from 'classnames'
import Loader from 'components/Loader'
import { useSelector } from 'features/hooks'
import { getClickCursorFull } from 'features/preferences/utils'
import styles from './index.module.scss'

interface ButtonProps {
  children: React.ReactNode
  type?: 'primary' | 'small' | 'ghost' | 'ghostWhite' | 'ghostDark' | 'light' | 'new' | 'red' | 'newblue'
  id?: string
  active?: boolean
  error?: boolean
  fullWidth?: boolean
  loading?: boolean
  loadingColor?: string
  loadingSize?: string
  containerClassName?: string
  containerStyle?: CSSProperties
  disabled?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
  style?: CSSProperties
  to?: string
  className?: string
}

export const Button = ({
  type = 'primary',
  error,
  id,
  active,
  children,
  containerStyle,
  containerClassName,
  disabled,
  fullWidth,
  loading,
  loadingColor,
  loadingSize,
  onClick,
  style,
  to,
  className
}: ButtonProps) => {
  const { customCursor } = useSelector(s => s.preferences)

  return (
    <div
      className={cx(styles.buttonWrapper, containerClassName, {
        [styles.disabled]: disabled,
        [styles.fullWidth]: fullWidth,
        [styles.error]: error,
        [styles.customCursor]: customCursor,
        [styles.active]: active
      })}
      style={containerStyle}
    >
      {to ? (
        <Link to={to}>
          <button className={cx(styles[type], className)} disabled={disabled} style={style} id={id}>
            {loading ? (
              <Loader className={styles.buttonLoader} stroke={loadingColor || 'white'} size={loadingSize || '10px'} />
            ) : (
              <span>{children}</span>
            )}
          </button>
        </Link>
      ) : (
        <button
          className={cx(styles[type], className)}
          onClick={onClick}
          disabled={disabled}
          style={{ ...style, cursor: getClickCursorFull() }}
          id={id}
        >
          {loading ? (
            <Loader className={styles.buttonLoader} stroke={loadingColor || 'white'} size={loadingSize || '10px'} />
          ) : (
            <span>{children}</span>
          )}
        </button>
      )}
    </div>
  )
}
