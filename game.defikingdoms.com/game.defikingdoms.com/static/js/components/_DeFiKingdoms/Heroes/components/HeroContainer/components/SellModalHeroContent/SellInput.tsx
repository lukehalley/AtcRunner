import { useState } from 'react'
import { Button } from 'components/Buttons'
import CuteJewel from 'components/CuteJewel'
import {
  setHeroDetailsModalHero,
  setHeroDetailsModalTitle,
  setSellAmount,
  setShowHeroDetailsModal
} from 'features/heroHub/state'
import { convertHeroId } from 'features/heroes/utils'
import { useDispatch } from 'features/hooks'
import styled from 'styled-components/macro'
import { capitalizeFirstLetter } from 'utils/capitalizeFirstLetter'
import { Hero } from 'utils/dfkTypes'

interface SellInputProps {
  hero: Hero
}

const SellInput = ({ hero }: SellInputProps) => {
  const dispatch = useDispatch()
  const [sellPrice, setSellPrice] = useState(0)

  const handleSellPriceChange = (e: any) => {
    setSellPrice(e.target.value)
  }

  const handleSellButtonClickLocal = () => {
    dispatch(setShowHeroDetailsModal(true))
    dispatch(setHeroDetailsModalTitle(`#${convertHeroId(hero.id)} — ${capitalizeFirstLetter(hero.name)}`))
    dispatch(setHeroDetailsModalHero(hero))
    dispatch(setSellAmount(sellPrice))
  }

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
      {!hero.isQuesting && (
        <>
          <StyledInput
            placeholder="0"
            type="number"
            min={0}
            value={sellPrice > 0 ? sellPrice : ''}
            onChange={handleSellPriceChange}
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
        {hero.isQuesting || !sellPrice || (sellPrice && sellPrice <= 0) ? (
          <Button
            type="ghostWhite"
            containerStyle={{ margin: '5px' }}
            style={{
              color: `${hero.isQuesting ? '#e55' : 'inherit'}`,
              borderColor: `${hero.isQuesting ? '#e55' : 'inherit'}`
            }}
            disabled
          >
            {hero.isQuesting ? 'On Quest' : 'List for Sale'}
          </Button>
        ) : (
          <Button type="ghost" containerStyle={{ margin: '5px' }} onClick={handleSellButtonClickLocal}>
            List for Sale
          </Button>
        )}
      </div>
    </div>
  )
}

export default SellInput

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
