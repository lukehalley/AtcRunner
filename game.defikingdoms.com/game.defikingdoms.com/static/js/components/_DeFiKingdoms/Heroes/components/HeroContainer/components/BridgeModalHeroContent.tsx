import { MouseEventHandler } from 'react'
import { Button } from 'components/Buttons'
import { addSelectedHeroes, removeSelectedHero } from 'features/bridge/state'
import { setShowHeroHub } from 'features/heroHub/state'
import { useDispatch, useSelector } from 'features/hooks'
import styled from 'styled-components/macro'
import { Hero } from 'utils/dfkTypes'
import HeroDetailActions from './HeroDetailActions'
import LazyHeroCard from './LazyHeroCard'

interface BridgeModalHeroContentProps {
  handleFlipButtonClicked: MouseEventHandler<Element>
  hero: Hero
  isFlipped: boolean
}

const BridgeModalHeroContent = ({ handleFlipButtonClicked, hero, isFlipped }: BridgeModalHeroContentProps) => {
  const dispatch = useDispatch()
  const { allAnimated } = useSelector(s => s.heroHub)
  const { selectedHeroes } = useSelector(s => s.bridge)
  const maxBridgeHeroes = 6
  const isAlreadySelected = selectedHeroes.some(selectedHero => selectedHero.id === hero.id)
  const heroListedForSale = hero.price > 0
  const heroListedForHire = hero.summoningPrice > 0
  const heroQuesting = hero.isQuesting

  const handleSelectHeroJourneyButtonClick = () => {
    if (isAlreadySelected) {
      dispatch(removeSelectedHero(hero))
    } else {
      dispatch(addSelectedHeroes({ hero: [hero], maxHeroes: maxBridgeHeroes }))
      dispatch(setShowHeroHub(false))
    }
  }

  return (
    <>
      <CardStatus disabled={heroQuesting || isAlreadySelected || heroListedForSale || heroListedForHire}>
        <LazyHeroCard hero={hero} isAnimated={allAnimated} isFlipped={isFlipped} />
      </CardStatus>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {heroListedForSale && (
          <Button type="small" disabled>
            Listed For Sale
          </Button>
        )}
        {heroListedForHire && (
          <Button type="small" disabled>
            Listed For Hire
          </Button>
        )}
        {!heroListedForSale && heroQuesting && (
          <Button type="small" disabled>
            On a Quest
          </Button>
        )}
        {((!heroListedForSale && !heroQuesting && !heroListedForHire) || isAlreadySelected) && (
          <Button type="small" onClick={handleSelectHeroJourneyButtonClick}>
            {isAlreadySelected ? 'Deselect Hero' : 'Select Hero'}
          </Button>
        )}
      </div>
      <HeroDetailActions hero={hero} handleFlipButtonClicked={handleFlipButtonClicked} />
    </>
  )
}

export default BridgeModalHeroContent

interface CardStatusProps {
  disabled: boolean
}

const CardStatus = styled.div<CardStatusProps>`
  opacity: ${props => (!props.disabled ? 1 : 0.5)};
`
