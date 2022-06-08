import { MouseEventHandler } from 'react'
import { Button } from 'components/Buttons'
import { useSelector } from 'features/hooks'
import styled from 'styled-components/macro'
import { Hero } from 'utils/dfkTypes'
import LazyHeroCard from '../LazyHeroCard'
import Wrapper from '../Wrapper'
import SellInput from './SellInput'
import ShowSalePrice from './ShowSalePrice'

interface SellModalHeroContentProps {
  handleFlipButtonClicked: MouseEventHandler
  hero: Hero
  isFlipped: boolean
}

const SellModalHeroContent = ({ handleFlipButtonClicked, hero, isFlipped }: SellModalHeroContentProps) => {
  const { allAnimated } = useSelector(s => s.heroHub)

  return (
    <>
      <CardStatus>
        <LazyHeroCard hero={hero} isAnimated={allAnimated} isFlipped={isFlipped} />
      </CardStatus>
      {hero.price > 0 ? (
        <Wrapper>
          <ShowSalePrice hero={hero} />
        </Wrapper>
      ) : (
        <SellInput hero={hero} />
      )}
      <div style={{ textAlign: 'center', margin: '0 auto' }}>
        <Button type="small" containerStyle={{ margin: '6px auto' }} onClick={handleFlipButtonClicked}>
          Flip Card
        </Button>
      </div>
    </>
  )
}

export default SellModalHeroContent

interface CardStatusProps {
  disabled?: boolean
}

const CardStatus = styled.div<CardStatusProps>`
  opacity: ${props => (!props.disabled ? 1 : 0.5)};
`
