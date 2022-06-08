import goldIcon from 'assets/images/gui/gold.png'
import styles from './index.module.scss'

const GoldIcon = ({ style }: any) => {
  return <img className={styles.goldIcon} src={goldIcon} alt="" style={style} />
}

export default GoldIcon
