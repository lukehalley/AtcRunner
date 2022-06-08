import { useSelector } from 'features/hooks'
import goldBag from 'features/items/images/gold-bag.png'
import goldPile from 'features/items/images/gold-pile.png'
import FancyBlock from '../FancyBlock'
import styles from './index.module.scss'

const GoldPile = () => {
  const { goldBalance } = useSelector(s => s.items)
  const formattedGold = goldBalance && goldBalance.toFixed(3)

  return (
    <div className={styles.goldWrapper}>
      <FancyBlock>
        <div className={styles.goldPiles}>
          <img src={goldBag} alt="" />
          <img src={goldPile} alt="" />
        </div>
        <h3>{formattedGold || 0} Gold</h3>
      </FancyBlock>
    </div>
  )
}

export default GoldPile
