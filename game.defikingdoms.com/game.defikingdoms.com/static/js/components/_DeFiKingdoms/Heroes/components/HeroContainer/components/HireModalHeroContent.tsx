import { MouseEventHandler } from 'react'
import { Button } from 'components/Buttons'
import CuteJewel from 'components/CuteJewel'
import { setShowHeroHub } from 'features/heroHub/state'
import { calculateHeroSummonCost } from 'features/heroes/utils'
import { useDispatch, useSelector } from 'features/hooks'
import { setSelectedHero } from 'features/portal'
import { areHeroesRelated, getHeroTier, getMinTears } from 'features/portal/utils'
import styled from 'styled-components/macro'
import { red } from 'utils/colors'
import { Hero } from 'utils/dfkTypes'
import HeroDetailActions from './HeroDetailActions'
import LazyHeroCard from './LazyHeroCard'

interface HireModalHeroContent {
  handleFlipButtonClicked: MouseEventHandler
  hero: Hero
  isFlipped: boolean
}

const HireModalHeroContent = ({ handleFlipButtonClicked, hero, isFlipped }: any) => {
  const { allAnimated } = useSelector(s => s.heroHub)
  const { selectedHeroes, tears } = useSelector(s => s.portal)
  const tearsNeeded = getMinTears(getHeroTier(hero.class))
  const hasEnoughTears = tears >= tearsNeeded
  const summonCost = calculateHeroSummonCost(hero.generation, hero.summons)

  const dispatch = useDispatch()
  function handleHireClick() {
    dispatch(setShowHeroHub(false))
    dispatch(setSelectedHero({ hero, position: 'secondary', wasHired: true }))
  }

  const currentlySelectedHero = selectedHeroes.primary
  const related = areHeroesRelated(currentlySelectedHero, hero)

  return (
    <>
      <CardStatus related={related}>
        <LazyHeroCard hero={hero} isAnimated={allAnimated} isFlipped={isFlipped} />
      </CardStatus>
      <HeroDetailActions hero={hero} handleFlipButtonClicked={handleFlipButtonClicked} />
      <div
        className="pricing align-center"
        style={{ display: `${hero.summoningPrice ? 'flex' : 'hidden'}`, justifyContent: 'center' }}
      >
        <FeeWrapper>
          <span>Hire Price</span>
          <br />
          <div className="price">
            <CuteJewel />
            {hero.summoningPrice}
          </div>
        </FeeWrapper>

        <FeeWrapper>
          <span>Summon Fee</span>
          <br />
          <div className="price">
            <CuteJewel />
            {summonCost}
          </div>
        </FeeWrapper>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {related ? (
          <Button type="small" disabled>
            Ineligible due to Common origin
          </Button>
        ) : !hasEnoughTears ? (
          <DeficientTears style={{ display: 'block', textAlign: 'center', color: red }}>
            {tearsNeeded} tears required.
          </DeficientTears>
        ) : (
          <Button type="small" onClick={handleHireClick}>
            Hire Hero
          </Button>
        )}
      </div>
    </>
  )
}

export default HireModalHeroContent

interface CardStatusProps {
  related: boolean
}

const CardStatus = styled.div<CardStatusProps>`
  opacity: ${props => (!props.related ? 1 : 0.5)};
`

const FeeWrapper = styled.div`
  padding: 0 0.75em;
`
const DeficientTears = styled.span`
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  text-align: 'center';
  color: ${red};
`
