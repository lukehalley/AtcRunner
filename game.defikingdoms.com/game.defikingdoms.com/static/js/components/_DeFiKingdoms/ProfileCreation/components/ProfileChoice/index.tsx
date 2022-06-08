import cx from 'classnames'
import HeroProfile from 'components/_DeFiKingdoms/Heroes/components/HeroProfile'
import { ProfileCollection } from 'features/profile/types'
import { Hero } from 'utils/dfkTypes'
import styles from './index.module.scss'

interface ProfileChoiceProps {
  picData: {
    id: number
    collectionId: number
    src: string
  }
  hero?: Hero
  onClick: Function
  selected: boolean
}

export default function ProfileChoice({ hero, onClick, picData, selected }: ProfileChoiceProps) {
  const handleClick = () => {
    onClick(picData)
  }

  return (
    <button
      className={cx(styles.profileChoiceWrapper, {
        [styles.selected]: selected,
        [styles.boredApe]: picData.collectionId === ProfileCollection.BORED_APE
      })}
      onClick={handleClick}
    >
      <div className={styles.profileChoiceFrame} />
      {picData.collectionId === ProfileCollection.HERO && hero ? (
        <HeroProfile hero={hero} profileChoice />
      ) : (
        <img src={picData.src} alt="" />
      )}
    </button>
  )
}
