import { MouseEventHandler } from 'react'
import { Button } from 'components/Buttons'
import { useSelector } from 'features/hooks'
import moment from 'moment'
import styled from 'styled-components/macro'
import { Hero } from 'utils/dfkTypes'
import LazyHeroCard from '../LazyHeroCard'
import SummonTimer from '../SummonTimer'
import Wrapper from '../Wrapper'
import RentalInput from './RentalInput'
import ShowRentPrice from './ShowRentPrice'

interface RentModalHeroContentProps {
  handleFlipButtonClicked: MouseEventHandler
  hero: Hero
  isFlipped: boolean
}

const RentModalHeroContent = ({ handleFlipButtonClicked, hero, isFlipped }: RentModalHeroContentProps) => {
  const { allAnimated } = useSelector(s => s.heroHub)
  const countDownDate = moment
    .utc(hero.nextSummonTime.ts)
    .zone('-08:00') // Denver Time Zone
    .toDate()
  const remainingSummons = hero.maxSummons - hero.summons
  const outOfSummons = hero.generation > 0 && remainingSummons <= 0

  return (
    <>
      <CardStatus disabled={outOfSummons}>
        <LazyHeroCard hero={hero} isAnimated={allAnimated} isFlipped={isFlipped} />
      </CardStatus>

      <SummonTimer countDownTime={countDownDate}>
        {hero.summoningPrice > 0 ? (
          <Wrapper>
            <ShowRentPrice hero={hero} />
          </Wrapper>
        ) : (
          <RentalInput hero={hero} />
        )}
      </SummonTimer>
      <div style={{ textAlign: 'center', margin: '0 auto' }}>
        <Button type="small" containerStyle={{ margin: '6px auto' }} onClick={handleFlipButtonClicked}>
          Flip Card
        </Button>
      </div>
    </>
  )
}

export default RentModalHeroContent

interface CardStatusProps {
  disabled: boolean
}

const CardStatus = styled.div<CardStatusProps>`
  opacity: ${props => (!props.disabled ? 1 : 0.5)};
`
