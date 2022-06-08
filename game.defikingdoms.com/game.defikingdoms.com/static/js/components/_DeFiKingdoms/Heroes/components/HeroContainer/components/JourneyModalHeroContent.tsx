import { MouseEventHandler } from 'react'
import { Button } from 'components/Buttons'
import { useDispatch, useSelector } from 'features/hooks'
import { addSelectedHeroes, removeSelectedHero } from 'features/journey/state'
import styled from 'styled-components/macro'
import { Hero } from 'utils/dfkTypes'
import HeroDetailActions from './HeroDetailActions'
import LazyHeroCard from './LazyHeroCard'

interface JourneyModalHeroContentProps {
  handleFlipButtonClicked: MouseEventHandler<Element>
  hero: Hero
  isFlipped: boolean
}

const JourneyModalHeroContent = ({ handleFlipButtonClicked, hero, isFlipped }: JourneyModalHeroContentProps) => {
  const dispatch = useDispatch()
  const { allAnimated } = useSelector(s => s.heroHub)
  const { activeJourneyModalType, selectedHeroes } = useSelector(s => s.journey)
  const maxJourneyHeroes = 6
  const isAlreadySelected = selectedHeroes.some(selectedHero => selectedHero.id === hero.id)
  const heroListedForSale = hero.price > 0
  const heroListedForHire = hero.summoningPrice > 0
  const heroQuesting = hero.isQuesting
  const isGenZero = hero.generation === 0
  const genZeroOnStandard = activeJourneyModalType === 'journeyStandard' && isGenZero
  const genZeroFirst = activeJourneyModalType === 'journeyGenZero' && selectedHeroes.length < 1 && hero.generation > 0
  const genZeroSecond =
    activeJourneyModalType === 'journeyGenZero' && selectedHeroes.length >= 1 && hero.generation === 0

  const handleSelectHeroJourneyButtonClick = () => {
    if (isAlreadySelected) {
      dispatch(removeSelectedHero(hero))
    } else {
      dispatch(addSelectedHeroes({ hero: [hero], maxHeroes: maxJourneyHeroes }))
    }
  }

  return (
    <>
      <CardStatus
        disabled={
          isAlreadySelected ||
          heroListedForSale ||
          heroListedForHire ||
          heroQuesting ||
          genZeroOnStandard ||
          genZeroFirst ||
          genZeroSecond
        }
      >
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
        {genZeroOnStandard && (
          <Button type="small" disabled>
            Select from Gen 0 Tab
          </Button>
        )}
        {genZeroFirst && (
          <Button type="small" disabled>
            Select a Gen 0 First
          </Button>
        )}
        {genZeroSecond && !isAlreadySelected && (
          <Button type="small" disabled>
            Gen 0 Already Selected
          </Button>
        )}
        {((!heroListedForSale &&
          !heroQuesting &&
          !heroListedForHire &&
          !genZeroOnStandard &&
          !genZeroFirst &&
          !genZeroSecond) ||
          isAlreadySelected) && (
          <Button type="small" onClick={handleSelectHeroJourneyButtonClick}>
            {isAlreadySelected ? 'Deselect Hero' : 'Select Hero'}
          </Button>
        )}
      </div>
      <HeroDetailActions hero={hero} handleFlipButtonClicked={handleFlipButtonClicked} />
    </>
  )
}

export default JourneyModalHeroContent

interface CardStatusProps {
  disabled: boolean
}

const CardStatus = styled.div<CardStatusProps>`
  opacity: ${props => (!props.disabled ? 1 : 0.5)};
`
