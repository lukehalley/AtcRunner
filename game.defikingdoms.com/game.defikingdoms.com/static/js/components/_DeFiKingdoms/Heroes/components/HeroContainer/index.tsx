import { useState, useEffect, memo } from 'react'
import { ActiveModalType } from 'features/heroHub/types'
import { useSelector } from 'features/hooks'
import styled from 'styled-components/macro'
import { Hero } from 'utils/dfkTypes'
import ApplyItemModalHeroContent from './components/ApplyItemModalHeroContent'
import BridgeModalHeroContent from './components/BridgeModalHeroContent'
import BuyModalHeroContent from './components/BuyModalHeroContent'
import DeadModalHeroContent from './components/DeadModalHeroContent'
import HireModalHeroContent from './components/HireModalHeroContent'
import JourneyModalHeroContent from './components/JourneyModalHeroContent'
import LevelModalHeroContent from './components/LevelModalHeroContent'
import PortalModalHeroContent from './components/PortalModalHeroContent'
import QuestModalHeroContent from './components/QuestModalHeroContent'
import RentModalHeroContent from './components/RentModalHeroContent'
import RerollModalHeroContent from './components/RerollModalHeroContent'
import SellModalHeroContent from './components/SellModalHeroContent'
import SendModalHeroContent from './components/SendModalHeroContent'
import ViewModalHeroContent from './components/ViewModalHeroContent'

interface HeroContainerProps {
  hero: Hero
}

const HeroContainer = ({ hero }: HeroContainerProps) => {
  const { activeModalType, allFlipped } = useSelector(s => s.heroHub)
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    setIsFlipped(allFlipped)
  }, [allFlipped])

  const handleFlipButtonClicked = () => setIsFlipped(!isFlipped)

  return (
    <>
      {activeModalType === ActiveModalType.catalog && (
        <ViewModalHeroContent handleFlipButtonClicked={handleFlipButtonClicked} isFlipped={isFlipped} hero={hero} />
      )}
      {activeModalType === ActiveModalType.buy && (
        <BuyModalHeroContent handleFlipButtonClicked={handleFlipButtonClicked} isFlipped={isFlipped} hero={hero} />
      )}
      {activeModalType === ActiveModalType.hire && (
        <HireModalHeroContent handleFlipButtonClicked={handleFlipButtonClicked} isFlipped={isFlipped} hero={hero} />
      )}
      {activeModalType === ActiveModalType.rent && (
        <RentModalHeroContent handleFlipButtonClicked={handleFlipButtonClicked} isFlipped={isFlipped} hero={hero} />
      )}
      {activeModalType === ActiveModalType.sell && (
        <SellModalHeroContent handleFlipButtonClicked={handleFlipButtonClicked} isFlipped={isFlipped} hero={hero} />
      )}
      {activeModalType === ActiveModalType.send && (
        <SendModalHeroContent handleFlipButtonClicked={handleFlipButtonClicked} isFlipped={isFlipped} hero={hero} />
      )}
      {activeModalType === ActiveModalType.portal && (
        <PortalModalHeroContent handleFlipButtonClicked={handleFlipButtonClicked} isFlipped={isFlipped} hero={hero} />
      )}
      {activeModalType === ActiveModalType.quest && (
        <QuestModalHeroContent handleFlipButtonClicked={handleFlipButtonClicked} isFlipped={isFlipped} hero={hero} />
      )}
      {activeModalType === ActiveModalType.view && (
        <ViewModalHeroContent handleFlipButtonClicked={handleFlipButtonClicked} isFlipped={isFlipped} hero={hero} />
      )}
      {activeModalType === ActiveModalType.level && (
        <LevelModalHeroContent handleFlipButtonClicked={handleFlipButtonClicked} isFlipped={isFlipped} hero={hero} />
      )}
      {activeModalType === ActiveModalType.applyItem && (
        <ApplyItemModalHeroContent
          handleFlipButtonClicked={handleFlipButtonClicked}
          isFlipped={isFlipped}
          hero={hero}
        />
      )}
      {activeModalType === ActiveModalType.reroll && (
        <RerollModalHeroContent handleFlipButtonClicked={handleFlipButtonClicked} isFlipped={isFlipped} hero={hero} />
      )}
      {activeModalType === ActiveModalType.dead && <DeadModalHeroContent hero={hero} />}
      {activeModalType === ActiveModalType.bridge && (
        <BridgeModalHeroContent handleFlipButtonClicked={handleFlipButtonClicked} isFlipped={isFlipped} hero={hero} />
      )}
      {(activeModalType === ActiveModalType.journey || activeModalType === ActiveModalType.journeyChance) && (
        <JourneyModalHeroContent handleFlipButtonClicked={handleFlipButtonClicked} isFlipped={isFlipped} hero={hero} />
      )}
    </>
  )
}

export default memo(HeroContainer)

const InputBase = styled.input.attrs(props => ({
  className: 'input-base'
}))`
  padding: '18px';
  width: auto;
  background-image: none;
  border: 1px solid #fac05d;
  border-radius: 8px;
  padding: 5px 35px;
  font-weight: 400;
  font-size: 12px;
  text-align: center;
  color: white;
  text-decoration: none;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  position: relative;
  z-index: 1;
  color: #fac05d;
  opacity: 1;

  &:disabled {
    cursor: auto;
  }
`

export const StyledInput = styled(InputBase)`
  background-color: black;
  color: white;
  max-width: 150px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 16px;
    max-width: 250px;
  `};
`
