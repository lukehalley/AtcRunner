import { MouseEventHandler } from 'react'
import { Button } from 'components/Buttons'
import CuteJewel from 'components/CuteJewel'
import { setShowHeroHub } from 'features/heroHub/state'
import { ActiveModalType } from 'features/heroHub/types'
import { calculateHeroSummonCost } from 'features/heroes/utils'
import { useDispatch, useSelector } from 'features/hooks'
import { setSelectedHero } from 'features/portal'
import { HeroPosition } from 'features/portal/types'
import { areHeroesRelated, getHeroTier, getMinTears } from 'features/portal/utils'
import moment from 'moment'
import styled from 'styled-components/macro'
import { red } from 'utils/colors'
import HeroDetailActions from './HeroDetailActions'
import LazyHeroCard from './LazyHeroCard'
import SummonTimer from './SummonTimer'

interface PortalModalHeroContentProps {
  handleFlipButtonClicked: MouseEventHandler<HTMLButtonElement>
  hero: any
  isFlipped: boolean
}

const PortalModalHeroContent = ({ handleFlipButtonClicked, hero, isFlipped }: PortalModalHeroContentProps) => {
  const dispatch = useDispatch()
  const { activeModalType, allAnimated } = useSelector(s => s.heroHub)
  const { selectedHeroes, currentlySelecting, tears } = useSelector(s => s.portal)
  const summonCost = calculateHeroSummonCost(hero.generation, hero.summons)
  const denverTimeZone = '-08:00'
  const tearsNeeded = getMinTears(getHeroTier(hero.class))
  const hasEnoughTears = tears >= tearsNeeded
  const countDownDate = moment.utc(hero.nextSummonTime.ts).zone(denverTimeZone).toDate()

  const currentlySelectedHero = currentlySelecting === 'primary' ? selectedHeroes.secondary : selectedHeroes.primary
  const related = areHeroesRelated(currentlySelectedHero, hero)
  const alreadySelected = selectedHeroes.primary?.id === hero.id || selectedHeroes.secondary?.id === hero.id

  const hasCommonOrigin = hero.price === 0 && hero.summoningPrice === 0 && related && !alreadySelected
  const isForSale = hero.price > 0
  const isForHire = hero.summoningPrice > 0
  const isSelectable =
    hasEnoughTears &&
    !isForSale &&
    !isForHire &&
    !related &&
    !alreadySelected &&
    (activeModalType === ActiveModalType.send || hero.generation === 0 || hero.summons < hero.maxSummons)
  const isOutOfSummons =
    activeModalType === ActiveModalType.portal && hero.generation > 0 && hero.summons >= hero.maxSummons

  function handleSelectHero() {
    dispatch(setSelectedHero({ hero, position: currentlySelecting as HeroPosition, wasHired: false }))
    dispatch(setShowHeroHub(false))
  }

  return (
    <>
      <CardStatus disabled={isForSale || isForHire || related || alreadySelected || isOutOfSummons}>
        <LazyHeroCard hero={hero} isAnimated={allAnimated} isFlipped={isFlipped} />
      </CardStatus>
      <SummonTimer countDownTime={countDownDate}>
        <>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {hasCommonOrigin && (
              <Button type="small" disabled>
                Ineligible due to Common origin
              </Button>
            )}
            {isForSale && (
              <Button type="small" disabled>
                Listed For Sale
              </Button>
            )}
            {alreadySelected && (
              <Button type="small" disabled>
                Already Selected
              </Button>
            )}
            {isForHire && (
              <Button type="small" disabled>
                Listed For Hire
              </Button>
            )}
            {isSelectable && (
              <Button type="small" onClick={handleSelectHero}>
                Select Hero
                {activeModalType === ActiveModalType.portal && (
                  <>
                    {' '}
                    (<CuteJewel style={{ width: '8px' }} />
                    {summonCost})
                  </>
                )}
              </Button>
            )}
            {isOutOfSummons && (
              <Button type="small" disabled>
                Out of Summons
              </Button>
            )}
          </div>
          {!hasEnoughTears && (
            <DeficientTears style={{ display: 'block', textAlign: 'center', color: red }}>
              {tearsNeeded} tears required.
            </DeficientTears>
          )}
        </>
      </SummonTimer>
      <HeroDetailActions hero={hero} handleFlipButtonClicked={handleFlipButtonClicked} />
    </>
  )
}

export default PortalModalHeroContent

interface CardStatusProps {
  disabled: boolean
}

const CardStatus = styled.div<CardStatusProps>`
  opacity: ${props => (!props.disabled ? 1 : 0.5)};
`

const DeficientTears = styled.span`
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  text-align: 'center';
  color: red;
`
