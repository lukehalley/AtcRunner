import { Button } from 'components/Buttons'
import CuteJewel from 'components/CuteJewel'
import { BigNumber, utils } from 'ethers'
import { setShowHeroHub } from 'features/heroHub/state'
import { setShowHeroDetailsModal } from 'features/heroHub/state'
import { useDispatch, useSelector } from 'features/hooks'
import { setSelectedHero } from 'features/portal'
import { getHeroTier, getMinTears } from 'features/portal/utils'
import styled from 'styled-components/macro'
import colors from 'utils/colors'
import { red } from 'utils/colors'
import HeroCard from '../../HeroCard'
import ProfilePic from '../../ProfilePic'
import Lineage from './Lineage'
import SaleHistory from './SaleHistory'
import StatsList from './StatsList'

const HireHeroConfirm = () => {
  const dispatch = useDispatch()
  const hero: any = useSelector(s => s.heroHub.heroDetailsModalHero)
  const { tears } = useSelector(s => s.portal)
  const tearsNeeded = hero ? getMinTears(getHeroTier(hero.class)) : 10
  const hasEnoughTears = tears >= tearsNeeded

  const handleHireClicked = () => {
    if (!hero) return
    dispatch(setSelectedHero({ hero, position: 'secondary', wasHired: true }))
    dispatch(setShowHeroHub(false))
    dispatch(setShowHeroDetailsModal(false))
  }

  return (
    <>
      {hero && (
        <ColumnsContainer>
          <ColumnLeft>
            <div>
              <div className="align-right">
                {hero.price > 0 && <ForSale private={hero.winner}>{hero.winner ? 'Private Sale' : 'For Sale'}</ForSale>}
                {/* TODO: return this to its original setup after private hires are available */}
                {hero.summoningPrice > 0 && (
                  <SummonAssist>
                    {/* {hero.winner ? 'Private Hire' : 'For Hire'} */}
                    For Hire
                  </SummonAssist>
                )}
              </div>
            </div>
            <div style={{ padding: '20px 0px 20px 0px' }}>
              <HeroCard isFlipped={false} hero={hero} />
              <div style={{ paddingTop: '10px' }}>
                <ProfilePic profile={hero.owner} />
              </div>
            </div>
          </ColumnLeft>
          <ColumnRight>
            <div
              className="grid2 align-center"
              style={{
                display: 'flex',
                justifyContent: 'space-around'
              }}
            >
              {hero.summoningPrice > 0 && (
                <div>
                  <div className="grid2-auto">
                    <ProfileTextStyled>
                      <p style={{ margin: 0, textAlign: 'right' }}>Hire Price</p>
                    </ProfileTextStyled>
                    <div style={{ textAlign: 'left' }}>
                      <CuteJewel />

                      <span
                        style={{
                          textAlign: 'left',
                          font: 'normal normal bold 24px/35px Poppins',
                          fontFamily: 'Poppins, sans-serif',
                          letterSpacing: '0px',
                          color: '#FFFFFF',
                          textShadow: '1px 2px 1px #100F21',
                          opacity: 1
                        }}
                      >
                        {hero.summoningPrice instanceof BigNumber
                          ? utils.formatEther(hero.summoningPrice)
                          : hero.summoningPrice}
                      </span>
                    </div>
                  </div>
                  {hasEnoughTears ? (
                    <Button onClick={handleHireClicked}>Hire {hero.name}</Button>
                  ) : (
                    <DeficientTears style={{ display: 'block', textAlign: 'center', color: red }}>
                      {tearsNeeded} tears required.
                    </DeficientTears>
                  )}
                  <p style={{ fontSize: '14px', width: '100%', marginTop: '0px' }}>Get help with Summoning</p>
                </div>
              )}
            </div>

            <BorderedBox>
              <StatsList hero={hero} />
            </BorderedBox>

            <BorderedBox>
              <Lineage hero={hero} />
            </BorderedBox>

            <BorderedBox>
              <SaleHistory hero={hero} />
            </BorderedBox>
          </ColumnRight>
        </ColumnsContainer>
      )}
    </>
  )
}

export default HireHeroConfirm

const SummonAssist = styled.div.attrs(props => ({
  className: 'summon-assist'
}))`
  font-weight: 400;
  color: white;
  background: ${colors.redTag};
  text-transform: uppercase;
  font-size: 10px;
  width: inherit;
  display: inline-block;
  letter-spacing: 1px;
  padding: 3px 10px;
  margin-left: 6px;
`

const ProfileTextStyled = styled.div`
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: left;
  text-align: left;
  font: normal normal normal 12px/18px Poppins;
  font-family: 'Poppins', sans-serif;
  letter-spacing: 0px;
  color: #ffffff;
  text-shadow: 1px 2px 1px #100f21;
  opacity: 0.5;
  margin-right: 10px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: auto;
    max-width: 270px;
    display: flex;
    flex-flow: row nowrap;
  `};
`

const ColumnsContainer = styled.div.attrs(props => ({
  className: 'column-container'
}))`
  display: flex;
  flex-direction: row;
  justify-content: space-around;

  @media (max-width: 960px) {
    flex-direction: column;
    justify-content: center;
  }
`

const ColumnLeft = styled.div.attrs(props => ({
  className: 'column-left'
}))`
  width: 100%;
  max-width: 1000px;

  @media (max-width: 960px) {
    align-self: center;
  }
`

const ColumnRight = styled.div.attrs(props => ({
  className: 'column-right'
}))`
  width: 100%;
  margin: 0% 10% 10% 10%;
  justify-content: center;

  @media (max-width: 960px) {
    align-self: center;
  }
`

const ForSale = styled.div.attrs((props): any => ({
  className: 'tag-sale'
}))`
  font-weight: 400;
  color: white;
  background: ${props => (props.private ? colors.purpleTag : colors.greenTag)};
  text-transform: uppercase;
  font-size: 10px;
  width: inherit;
  display: inline-block;
  letter-spacing: 1px;
  padding: 3px 10px;
  margin-left: 6px;
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

const DeficientTears = styled.span`
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  text-align: 'center';
  color: ${red};
`
