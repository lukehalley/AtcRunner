import { useEffect, useState } from 'react'
import { faGavel } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Tooltip } from '@material-ui/core'
import { Button } from 'components/Buttons'
import CuteJewel from 'components/CuteJewel'
import { TokenAmount } from 'constants/sdk-extra'
import { handleBuyHero, reapproveContract } from 'features/heroes/contracts'
import { calculateCurrentAuctionPrice, calculatePriceChangeOverTime } from 'features/heroes/utils'
import { useSelector } from 'features/hooks'
import { Profile } from 'features/profile/types'
import { convertRawProfile } from 'features/profile/utils'
import { useTransactionAdder } from 'features/transactions/hooks'
import { useActiveWeb3React } from 'hooks'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useGovTokenContract } from 'hooks/useContract'
import moment from 'moment'
import styled from 'styled-components/macro'
import colors from 'utils/colors'
import { getProfilesCore, getSaleAuctionCore } from 'utils/contracts'
import errorHandler from 'utils/errorHandler'
import { GOVERNANCE_TOKEN } from '../../../../../../constants'
import HeroCard from '../../HeroCard'
import SummonTimer from '../../HeroContainer/components/SummonTimer'
import ProfilePic from '../../ProfilePic'
import Lineage from './Lineage'
import SaleHistory from './SaleHistory'
import StatsList from './StatsList'

const BuyHeroConfirm = () => {
  const { account, chainId } = useActiveWeb3React()
  const hero: any = useSelector(s => s.heroHub.heroDetailsModalHero)
  const govToken = GOVERNANCE_TOKEN[chainId || 1666600000]
  const saleAuctionCore = getSaleAuctionCore({ account, chainId })
  const addTransaction = useTransactionAdder()
  const profilesCore = getProfilesCore()
  const govTokenContract = useGovTokenContract()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [transactionProcessing, setTransactionProcessing] = useState(false)
  const [buyApproval, buyApprovalCallback] = useApproveCallback(
    new TokenAmount(govToken, BigInt('20000')),
    saleAuctionCore?.address
  )
  let auctionPriceChange = null
  let priceChangeMessage = null
  let changeDirection = 'decreases'

  // Poll for current pricing
  const [, setTime] = useState(Date.now())
  useEffect(() => {
    getHeroProfile()

    if (!hero.auction || !hero.auction.onAuction) return
    const pollInterval = 1000
    const interval = setInterval(() => {
      setTime(Date.now())
    }, pollInterval)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const countDownDate = moment
    .utc(hero.nextSummonTime.ts)
    .zone('-08:00') // Denver Time Zone
    .toDate()

  const getHeroProfile = async () => {
    try {
      const profileRaw = await profilesCore.getProfile(hero.owner.owner)
      const formattedProfile = await convertRawProfile(profileRaw)
      setProfile(formattedProfile)
    } catch (error) {
      errorHandler(error)
    }
  }

  const salePrice =
    hero.auction && hero.auction.onAuction
      ? calculateCurrentAuctionPrice(
          hero.auction.startingPrice,
          hero.auction.endingPrice,
          hero.auction.startedAt,
          hero.auction.duration
        )
      : hero.price

  if (hero.auction && hero.auction.onAuction) {
    if (hero.auction.startingPrice < hero.auction.endingPrice) {
      changeDirection = 'increases'
    }
    auctionPriceChange = calculatePriceChangeOverTime(
      hero.auction.startingPrice,
      hero.auction.endingPrice,
      hero.auction.duration
    )
    priceChangeMessage = (
      <p style={{ fontSize: '13px', lineHeight: '1.6', margin: '0', opacity: '.75' }}>
        Price {changeDirection} by ~<strong>{auctionPriceChange} JEWEL</strong> every second
      </p>
    )
  }

  const handleBuyHeroClick = async (hero: any) => {
    handleBuyHero(hero, addTransaction, setTransactionProcessing)
  }

  const reapproveContractLocal = async () => {
    reapproveContract(govTokenContract, addTransaction)
  }

  return (
    <>
      {hero && (
        <ColumnsContainer>
          <ColumnLeft>
            <div>
              <div className="align-right">
                {hero.price > 0 && <ForSale private={hero.winner}>{hero.winner ? 'Private Sale' : 'For Sale'}</ForSale>}
                {hero.summoningPrice > 0 && <SummonAssist>{hero.winner ? 'Private Hire' : 'For Hire'}</SummonAssist>}
              </div>
            </div>
            <div style={{ padding: '20px 0px 20px 0px' }}>
              <HeroCard isFlipped={false} hero={hero} />
              <div style={{ paddingTop: '10px' }}>{profile && <ProfilePic profile={profile} />}</div>
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
              {hero.price > 0 && (
                <div>
                  <div className="grid2-auto">
                    <ProfileTextStyled>
                      <p style={{ margin: 0, textAlign: 'right' }}>Hero Price</p>
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
                        {salePrice}{' '}
                        {hero.auction && hero.auction.onAuction ? (
                          <Tooltip title="Auction prices change as time elapses. Final transaction price may be different than price shown.">
                            <span>
                              <FontAwesomeIcon icon={faGavel} size="xs" color="green" />
                            </span>
                          </Tooltip>
                        ) : null}
                      </span>
                    </div>
                  </div>

                  {priceChangeMessage}

                  {countDownDate && countDownDate > moment().toDate() && (
                    <>
                      <p style={{ fontSize: 10, textAlign: 'center', margin: 0 }}>Summon Cooldown</p>
                      <SummonTimer countDownTime={countDownDate}>{<></>}</SummonTimer>
                    </>
                  )}

                  {buyApproval !== ApprovalState.APPROVED && (
                    <Button onClick={buyApprovalCallback} disabled={buyApproval === ApprovalState.PENDING}>
                      Approve
                    </Button>
                  )}
                  {buyApproval === ApprovalState.APPROVED && (
                    <Button
                      onClick={() => {
                        handleBuyHeroClick(hero)
                      }}
                      loading={transactionProcessing}
                      disabled={transactionProcessing}
                    >
                      Buy Hero
                    </Button>
                  )}
                  <p style={{ fontSize: '14px', width: '100%', marginTop: '0px' }}>Make this Hero yours!</p>
                  <p style={{ fontSize: '12px', width: '100%', marginTop: '0px' }}>
                    Allowed contract limit too low?{' '}
                    <a onClick={reapproveContractLocal} style={{ color: 'white', textDecoration: 'underline' }}>
                      Click here
                    </a>{' '}
                    to re-approve
                  </p>
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

export default BuyHeroConfirm

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
  // display: flex;
  // flex-directtion: column!important;
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
