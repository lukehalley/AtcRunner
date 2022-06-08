import { CSSProperties } from 'react'
import { useActiveWeb3React } from 'hooks'
import { isDFKChainHook } from 'utils'
import cuteCrystal from 'assets/images/cute-crystal.png'
import cuteJewel from 'assets/images/cute-jewel.png'
import styles from './index.module.scss'

interface CuteJewelProps {
  style?: CSSProperties
}

const CuteJewel = ({ style }: CuteJewelProps) => {
  const { chainId } = useActiveWeb3React()

  return (
    <>
      {chainId && isDFKChainHook(chainId) ? (
        <img className={styles.cuteJewel} src={cuteCrystal} alt="" style={style} />
      ) : (
        <img className={styles.cuteJewel} src={cuteJewel} alt="" style={style} />
      )}
    </>
  )
}

export default CuteJewel
