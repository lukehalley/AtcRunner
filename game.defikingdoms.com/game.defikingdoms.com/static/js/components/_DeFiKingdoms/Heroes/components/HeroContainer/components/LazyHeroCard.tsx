import { useState } from 'react'
import { InView } from 'react-intersection-observer'
import styled from 'styled-components/macro'
import { Hero } from 'utils/dfkTypes'
import HeroCard from '../../HeroCard'

interface LazyHeroCardProps {
  hero: Hero
  isFlipped: boolean
  isAnimated?: boolean
}

const LazyHeroCard = ({ hero, isAnimated, isFlipped }: LazyHeroCardProps) => {
  const [visible, setVisible] = useState(false)

  return (
    <InView onChange={inView => setVisible(inView)}>
      <HeroCardWrapper>
        {visible && <HeroCard isAnimated={isAnimated} isFlipped={isFlipped} hero={hero} />}
      </HeroCardWrapper>
    </InView>
  )
}

export default LazyHeroCard

const HeroCardWrapper = styled.div`
  width: 300px;
  min-height: 430px;
  margin: 16px auto;
`
