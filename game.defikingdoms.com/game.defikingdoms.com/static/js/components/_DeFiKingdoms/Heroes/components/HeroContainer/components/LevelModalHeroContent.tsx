import { MouseEventHandler } from 'react'
import { Button } from 'components/Buttons'
import { setSingleSelectHero, setShowHeroHub } from 'features/heroHub/state'
import { useDispatch, useSelector } from 'features/hooks'
import { calculateRequiredXp } from 'features/leveling/utils'
import styled from 'styled-components/macro'
import { Hero } from 'utils/dfkTypes'
import HeroDetailActions from './HeroDetailActions'
import LazyHeroCard from './LazyHeroCard'

interface LevelModalHeroContentProps {
  handleFlipButtonClicked: MouseEventHandler<Element>
  hero: Hero
  isFlipped: boolean
}

const LevelModalHeroContent = ({ handleFlipButtonClicked, hero, isFlipped }: LevelModalHeroContentProps) => {
  const dispatch = useDispatch()
  const { allAnimated } = useSelector(s => s.heroHub)
  const handleSelectHero = () => {
    dispatch(setSingleSelectHero(hero))
    dispatch(setShowHeroHub(false))
  }

  const isXpFull = hero.xp >= calculateRequiredXp(hero.level)
  const levelMax = hero.level >= 20
  const heroListedForSale = hero.price > 0

  return (
    <>
      <CardStatus disabled={heroListedForSale || levelMax || !isXpFull}>
        <LazyHeroCard hero={hero} isAnimated={allAnimated} isFlipped={isFlipped} />
      </CardStatus>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {heroListedForSale && (
          <Button type="small" disabled>
            Listed For Sale
          </Button>
        )}
        {!isXpFull && (
          <Button type="small" disabled>
            Not enough XP
          </Button>
        )}
        {levelMax && (
          <Button type="small" disabled>
            Reached current max level
          </Button>
        )}
        {hero.price === 0 && hero.isQuesting && (
          <Button type="small" disabled>
            On a Quest
          </Button>
        )}
        {isXpFull && hero.price === 0 && !hero.isQuesting && !levelMax && (
          <Button type="small" onClick={handleSelectHero}>
            Select Hero
          </Button>
        )}
      </div>
      <HeroDetailActions hero={hero} handleFlipButtonClicked={handleFlipButtonClicked} />
    </>
  )
}

export default LevelModalHeroContent

interface CardStatusProps {
  disabled: boolean
}

const CardStatus = styled.div<CardStatusProps>`
  opacity: ${props => (!props.disabled ? 1 : 0.5)};
`
