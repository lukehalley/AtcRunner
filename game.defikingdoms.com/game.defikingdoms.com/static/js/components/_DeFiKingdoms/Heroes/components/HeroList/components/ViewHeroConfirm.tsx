import { useSelector } from 'features/hooks'
import styled from 'styled-components/macro'
import { Hero } from 'utils/dfkTypes'
import HeroCard from '../../HeroCard'
import Lineage from './Lineage'
import SaleHistory from './SaleHistory'
import StatsList from './StatsList'

interface ViewHeroConfirmProps {
  hero?: Hero
}

const ViewHeroConfirm = ({ hero }: ViewHeroConfirmProps) => {
  const { heroDetailsModalHero } = useSelector(s => s.heroHub)
  const viewHero = typeof hero !== 'undefined' ? hero : heroDetailsModalHero

  return (
    <>
      {viewHero && (
        <HeroSaleGrid>
          <div>
            <HeroCard isFlipped={false} hero={viewHero} />
          </div>

          <div>
            <BorderedBox noBorder={true} noBackground={true}>
              <StatsList hero={viewHero} />
            </BorderedBox>

            <BorderedBox>
              <Lineage hero={viewHero} />
            </BorderedBox>

            <BorderedBox>
              <SaleHistory hero={viewHero} />
            </BorderedBox>
          </div>
        </HeroSaleGrid>
      )}
    </>
  )
}

export default ViewHeroConfirm

const HeroSaleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  justify-content: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: repeat(1, 1fr);
  `};
`

const BorderedBox = styled.div.attrs(props => ({
  className: 'bordered-box'
}))<{ noBorder?: boolean; noBackground?: boolean }>`
  display: flex;
  flex-direction: row;
  background: ${({ noBackground }) =>
    noBackground
      ? 'none'
      : 'transparent linear-gradient(120deg, #100f2145 0%, #100f21e8 100%) 0% 0% no-repeat padding-box;'};
  border: ${({ noBorder }) => (noBorder ? '0px none #fff' : '2px solid #fac05d4d')};
  opacity: 1;
  width: 100%;
  padding: 5%;
  margin-bottom: 15px;

  @media (max-width: 960px) {
    align-self: center;
  }
`
