import { MouseEventHandler } from 'react'
import { Button } from 'components/Buttons'
import { setShowHeroHub } from 'features/heroHub/state'
import { useDispatch, useSelector } from 'features/hooks'
import { GEN0_REROLL_ADDRESSES } from 'features/reroll/constants'
import { validateRerollStatus } from 'features/reroll/contracts'
import { setSelectedHero, removeSelectedHero } from 'features/reroll/state'
import { useActiveWeb3React } from 'hooks'
import styled from 'styled-components/macro'
import { Hero } from 'utils/dfkTypes'
import HeroDetailActions from './HeroDetailActions'
import LazyHeroCard from './LazyHeroCard'

interface RerollModalHeroContentProps {
  handleFlipButtonClicked: MouseEventHandler<Element>
  hero: Hero
  isFlipped: boolean
}

const RerollModalHeroContent = ({ handleFlipButtonClicked, hero, isFlipped }: RerollModalHeroContentProps) => {
  const { chainId } = useActiveWeb3React()
  const dispatch = useDispatch()
  const { allAnimated } = useSelector(s => s.heroHub)
  const { selectedHero } = useSelector(s => s.reroll)
  const isAlreadySelected = selectedHero?.id === hero.id
  const heroListedForSale = hero.price > 0
  const heroListedForHire = hero.summoningPrice > 0
  const heroQuesting = hero.isQuesting
  const isGenZero = hero.generation === 0

  const handleSelectHeroRerollButtonClick = async () => {
    const isValid = await validateRerollStatus(hero)
    if (!isValid) {
      dispatch(removeSelectedHero())
      alert('This hero has already been rerolled.')
    } else if (isAlreadySelected) {
      dispatch(removeSelectedHero())
    } else {
      dispatch(setSelectedHero(hero))
      dispatch(setShowHeroHub(false))
    }
  }

  return (
    <>
      <CardStatus disabled={isAlreadySelected || heroListedForSale || heroListedForHire || heroQuesting || !isGenZero}>
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
        {!heroListedForSale && heroQuesting && chainId && hero.currentQuest === GEN0_REROLL_ADDRESSES[chainId] ? (
          <Button type="small" disabled>
            Pending Reroll
          </Button>
        ) : !heroListedForSale && heroQuesting ? (
          <Button type="small" disabled>
            On a Quest
          </Button>
        ) : (
          ''
        )}
        {((!heroListedForSale && !heroQuesting && !heroListedForHire && isGenZero) || isAlreadySelected) && (
          <Button type="small" onClick={handleSelectHeroRerollButtonClick}>
            {isAlreadySelected ? 'Deselect Hero' : 'Select Hero'}
          </Button>
        )}
      </div>
      <HeroDetailActions hero={hero} handleFlipButtonClicked={handleFlipButtonClicked} />
    </>
  )
}

export default RerollModalHeroContent

interface CardStatusProps {
  disabled: boolean
}

const CardStatus = styled.div<CardStatusProps>`
  opacity: ${props => (!props.disabled ? 1 : 0.5)};
`
