import { useState } from 'react'
import { Button } from 'components/Buttons'
import CuteJewel from 'components/CuteJewel'
import {
  setHeroDetailsModalHero,
  setHeroDetailsModalTitle,
  setRentAmount,
  setShowHeroDetailsModal
} from 'features/heroHub/state'
import { convertHeroId } from 'features/heroes/utils'
import { useDispatch } from 'features/hooks'
import styled from 'styled-components/macro'
import { capitalizeFirstLetter } from 'utils/capitalizeFirstLetter'
import { Hero } from 'utils/dfkTypes'

interface RentalInputProps {
  hero: Hero
}

const RentalInput = ({ hero }: RentalInputProps) => {
  const dispatch = useDispatch()
  const [rentPrice, setRentPrice] = useState(0)

  const handleRentPriceChange = (e: any) => {
    setRentPrice(e.target.value)
  }

  const handleRentButtonClickLocal = () => {
    dispatch(setShowHeroDetailsModal(true))
    dispatch(setHeroDetailsModalTitle(`#${convertHeroId(hero.id)} — ${capitalizeFirstLetter(hero.name)}`))
    dispatch(setHeroDetailsModalHero(hero))
    dispatch(setRentAmount(rentPrice))
  }

  const remainingSummons = hero.maxSummons - hero.summons
  const outOfSummons = hero.generation > 0 && remainingSummons <= 0

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        maxWidth: '300px',
        margin: '0 auto'
      }}
    >
      {!outOfSummons && (
        <>
          <StyledInput
            placeholder="0"
            type="number"
            min={0}
            value={rentPrice > 0 ? rentPrice : ''}
            onChange={handleRentPriceChange}
          />
          <CuteJewel style={{ position: 'absolute', top: 18, left: 22 }} />
        </>
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center'
        }}
      >
        {rentPrice && rentPrice > 0 && !outOfSummons ? (
          <Button type="ghost" containerStyle={{ margin: '5px' }} onClick={handleRentButtonClickLocal}>
            List for Hire
          </Button>
        ) : outOfSummons ? (
          <Button type="small" disabled>
            No summons remaining
          </Button>
        ) : (
          <Button type="ghostWhite" containerStyle={{ margin: '5px' }} disabled>
            List for Hire
          </Button>
        )}
      </div>
    </div>
  )
}

export default RentalInput

const InputBase = styled.input.attrs(props => ({
  className: 'input-base'
}))`
  padding: '18px';
  width: 100%;
  max-width: 280px;
  background-image: none;
  background-color: transparent;
  border: 1px solid #fac05d;
  border-radius: 8px;
  padding: 5px 35px;
  font-weight: 400;
  font-size: 16px;
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

const StyledInput = styled(InputBase)`
  background-color: transparent;
  color: white;
  max-width: 280px;
  margin: 5px;
  position: relative;
  font-weight: bold;
  font-size: 20px;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }
`
