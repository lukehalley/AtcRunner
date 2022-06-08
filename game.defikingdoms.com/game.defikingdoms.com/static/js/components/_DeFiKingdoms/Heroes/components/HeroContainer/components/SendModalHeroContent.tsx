import { MouseEventHandler } from 'react'
import { Button } from 'components/Buttons'
import { setSingleSelectHero, setShowHeroHub } from 'features/heroHub/state'
import { useDispatch, useSelector } from 'features/hooks'
import styled from 'styled-components/macro'
import { Hero } from 'utils/dfkTypes'
import HeroDetailActions from './HeroDetailActions'
import LazyHeroCard from './LazyHeroCard'

interface SendModalHeroContentProps {
  handleFlipButtonClicked: MouseEventHandler<HTMLButtonElement>
  hero: Hero
  isFlipped: boolean
}

const SendModalHeroContent = ({ handleFlipButtonClicked, hero, isFlipped }: SendModalHeroContentProps) => {
  const dispatch = useDispatch()
  const { allAnimated } = useSelector(s => s.heroHub)
  const handleSelectHero = () => {
    dispatch(setSingleSelectHero(hero))
    dispatch(setShowHeroHub(false))
  }

  return (
    <>
      <CardStatus disabled={hero.price > 0 || Boolean(hero.isQuesting)}>
        <LazyHeroCard hero={hero} isAnimated={allAnimated} isFlipped={isFlipped} />
      </CardStatus>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {hero.price > 0 && (
          <Button type="small" disabled>
            Listed For Sale
          </Button>
        )}
        {hero.price === 0 && (
          <Button type="small" onClick={handleSelectHero} disabled={hero.isQuesting}>
            {hero.isQuesting ? 'Hero Questing' : 'Select Hero'}
          </Button>
        )}
      </div>

      <HeroDetailActions hero={hero} handleFlipButtonClicked={handleFlipButtonClicked} />
    </>
  )
}

export default SendModalHeroContent

interface CardStatusProps {
  disabled: boolean
}

const CardStatus = styled.div<CardStatusProps>`
  opacity: ${props => (!props.disabled ? 1 : 0.5)};
`
