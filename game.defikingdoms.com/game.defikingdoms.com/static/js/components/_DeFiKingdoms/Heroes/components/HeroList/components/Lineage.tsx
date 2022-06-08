import { useEffect, useCallback, useState } from 'react'
import { ArrowLeft } from 'react-feather'
import { RARITY_COLORS } from 'features/heroes/constants'
import { fetchHeroLineage, setHeroLineage } from 'features/heroes/state'
import { convertHeroId } from 'features/heroes/utils'
import { useDispatch, useSelector } from 'features/hooks'
import styled, { css } from 'styled-components/macro'
import midJewel from 'assets/images/mid-jewel.png'
import Hero from '../../Hero'

interface LineageProps {
  hero: any
}

interface LineageHeroProps {
  id: any
  rarity: string
  rarityNum: number
  rarityColor: string
  assistantId: any
  summonerId: any
  mainClass: string
  class: string
  generation: number
}

interface LineageHeroComponentProps {
  hero: LineageHeroProps
  onClick?: Function
}

const LineageHero = ({ hero, onClick }: LineageHeroComponentProps) => (
  <Column>
    {hero ? <Hero hero={hero} noCard={true} onClick={hero.generation === 0 ? undefined : onClick} /> : null}
    <HeroText>#{convertHeroId(hero.id)}</HeroText>
    <HeroText color={RARITY_COLORS[hero.rarity]}>{hero.rarity.charAt(0).toUpperCase() + hero.rarity.slice(1)}</HeroText>
    <HeroText>
      Gen{hero.generation} {hero.mainClass}
    </HeroText>
  </Column>
)

const Lineage = ({ hero }: LineageProps) => {
  const dispatch = useDispatch()
  const { heroLineage } = useSelector(s => s.heroes)
  const [selectedHero, setSelectedHero] = useState<LineageHeroProps | null>(null)
  const [selectedHeroIsParent, setSelectedHeroIsParent] = useState(false)
  useEffect(() => {
    if (hero && hero.id) {
      dispatch(fetchHeroLineage(`${hero.id}`))
    }
    return () => {
      dispatch(setHeroLineage(null))
    }
  }, [hero?.id, dispatch])
  useEffect(() => {
    heroLineage?.id !== selectedHero?.id && setSelectedHero(heroLineage)
  }, [heroLineage])
  const onBackClick = useCallback(() => {
    setSelectedHero(heroLineage)
    setSelectedHeroIsParent(false)
  }, [heroLineage, setSelectedHero, setSelectedHeroIsParent])
  const onSummonerParentClick = useCallback(() => {
    setSelectedHero(heroLineage.summonerId)
    setSelectedHeroIsParent(true)
  }, [heroLineage?.summonerId, setSelectedHero, setSelectedHeroIsParent])
  const onAssistantParentClick = useCallback(() => {
    setSelectedHero(heroLineage?.assistantId)
    setSelectedHeroIsParent(true)
  }, [heroLineage?.assistantId, setSelectedHero, setSelectedHeroIsParent])

  return (
    <>
      <SaleHistoryContainer>
        <TitleWithJewelHr>
          {selectedHeroIsParent && <LineageBackArrow onClick={onBackClick} />}
          Lineage{selectedHeroIsParent ? ` of #${selectedHero?.id} ` : ''}
        </TitleWithJewelHr>
        {selectedHero && hero.generation !== 0 ? (
          <SaleHistoryInnerContainer>
            {selectedHero.summonerId && (
              <LineageHero
                hero={selectedHero.summonerId}
                onClick={selectedHeroIsParent ? undefined : onSummonerParentClick}
              />
            )}
            {selectedHero.assistantId && (
              <LineageHero
                hero={selectedHero.assistantId}
                onClick={selectedHeroIsParent ? undefined : onAssistantParentClick}
              />
            )}
          </SaleHistoryInnerContainer>
        ) : (
          <WowSuchEmpty>
            As one of a thousand rays shining in the dawn of a new age, this hero is the first of their line.
          </WowSuchEmpty>
        )}
      </SaleHistoryContainer>
    </>
  )
}

export default Lineage

const LineageBackArrow = styled(ArrowLeft)`
  position: absolute;
  top: 0;
  left: 0;
  &:hover {
    cursor: pointer;
  }
`

const COMMON_TEXT_STYLES = css`
  color: #ffffff;
  text-shadow: 1px 2px 1px #100f21;
  text-align: left;
  opacity: 0.8;
  letter-spacing: 0px;
`
const HeroText = styled.span`
  ${COMMON_TEXT_STYLES}
  padding-top: 5px;
  display: block;
  font: normal normal normal 12px/14px Lora;
  font-family: Lora, sans-serif;
  text-align: center;
  ${props => (props.color ? `color: ${props.color};` : '')}
`

const WowSuchEmpty = styled.div`
  ${COMMON_TEXT_STYLES}
  text-align: center;
  font: 'normal normal normal 12px Lora';
  font-family: 'Lora, serif';
  opacity: 0.5;
`

const SaleHistoryContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  width: 100%;
`

const SaleHistoryInnerContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  flex-direction: row;
  padding-bottom: 10px;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const TitleWithJewelHr = styled.h3`
  text-align: center;
  border-bottom: 2px solid #f0b859;
  position: relative;
  padding-bottom: 10px;
  font-size: 18px;
  font-family: 'Lora', serif;
  font-weight: normal;

  &:first-of-type {
    margin-top: 0px;
  }

  &:before {
    content: '';
    background-image: url(${midJewel});
    display: block;
    background-repeat: no-repeat;
    background-size: cover;
    image-rendering: -moz-crisp-edges;
    image-rendering: pixelated;
    width: 16px;
    height: 16px;
    position: absolute;
    bottom: -9px;
    left: 50%;
    transform: translateX(-50%);
  }
`
