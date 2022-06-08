import { MouseEventHandler } from 'react'
import { Button } from 'components/Buttons'
import { setHeroDetailsModalHero, setHeroDetailsModalTitle, setShowHeroDetailsModal } from 'features/heroHub/state'
import { convertHeroId } from 'features/heroes/utils'
import { useDispatch } from 'features/hooks'
import styled from 'styled-components/macro'
import { capitalizeFirstLetter } from 'utils/capitalizeFirstLetter'
import { Hero } from 'utils/dfkTypes'

interface HeroDetailActionsProps {
  handleFlipButtonClicked: MouseEventHandler
  handleDetailClick?: MouseEventHandler
  hero: Hero
}

const HeroDetailActions = ({ handleFlipButtonClicked, handleDetailClick, hero }: HeroDetailActionsProps) => {
  const dispatch = useDispatch()
  const handleHeroDetailsClick = () => {
    dispatch(setShowHeroDetailsModal(true))
    dispatch(setHeroDetailsModalTitle(`#${convertHeroId(hero.id)} — ${capitalizeFirstLetter(hero.name)}`))
    dispatch(setHeroDetailsModalHero(hero))
  }

  return (
    <ActionRow>
      <Button type="small" onClick={handleDetailClick || handleHeroDetailsClick} fullWidth>
        Hero Details
      </Button>
      <Button type="small" onClick={handleFlipButtonClicked} fullWidth>
        Flip Card
      </Button>
    </ActionRow>
  )
}

export default HeroDetailActions

const ActionRow = styled.div.attrs(props => ({
  className: 'action-row'
}))`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 10px;
  max-width: 300px;
  margin: 0 auto 6px;
`
