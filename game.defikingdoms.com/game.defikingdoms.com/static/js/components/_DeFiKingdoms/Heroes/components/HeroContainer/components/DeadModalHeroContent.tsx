import { useState } from 'react'
import { DKModal } from 'components/_DeFiKingdoms/DKModal'
import styled from 'styled-components'
import { Hero } from 'utils/dfkTypes'
import ViewHeroConfirm from '../../HeroList/components/ViewHeroConfirm'
import HeroDetailActions from './HeroDetailActions'
import LazyHeroCard from './LazyHeroCard'

interface DeadModalHeroContentProps {
  hero: Hero
}

const DeadModalHeroContent = ({ hero }: DeadModalHeroContentProps) => {
  const [detailsShown, setDetailsShown] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlipButtonClicked = () => {
    setIsFlipped(!isFlipped)
  }

  const handleDetailsButtonClick = () => {
    setDetailsShown(!detailsShown)
  }

  return (
    <>
      <CardWrapper>
        <LazyHeroCard hero={hero} isAnimated={true} isFlipped={isFlipped} />
      </CardWrapper>
      <HeroDetailActions
        handleDetailClick={handleDetailsButtonClick}
        hero={hero}
        handleFlipButtonClicked={handleFlipButtonClicked}
      />
      <DKModal
        showModal={detailsShown}
        setShowModal={setDetailsShown}
        title={`${hero.firstName} ${hero.lastName}`}
        maxWidth={1000}
      >
        <ViewHeroConfirm hero={hero} />
      </DKModal>
    </>
  )
}

export default DeadModalHeroContent

const CardWrapper = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: calc(480px * 0.75);
    width: calc(300px * 0.75);
    margin: 0 auto;

    > div {
      width: 300px;
      transform: scale(0.75);
      transform-origin: top left;
    }
  `};
`
