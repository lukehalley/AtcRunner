import { useState } from 'react'
import { FormControlLabel, FormLabel, RadioGroup, Radio } from '@material-ui/core'
import { Button } from 'components/Buttons'
import CuteJewel from 'components/CuteJewel'
import { ZERO_ADDRESS } from 'constants/index'
import { utils } from 'ethers'
import { setSellAmount, setShowHeroDetailsModal } from 'features/heroHub/state'
import { updateHero } from 'features/heroes/state'
import { useDispatch, useSelector } from 'features/hooks'
import { useTransactionAdder } from 'features/transactions/hooks'
import { useActiveWeb3React } from 'hooks'
// import { calculatePriceChangeOverTime } from 'components/_DeFiKingdoms/Heroes/utils/auctionCalculations'
import styled from 'styled-components/macro'
import { isHarmonyHook, setGas } from 'utils'
import { getSaleAuctionCore } from 'utils/contracts'
import errorHandler from 'utils/errorHandler'
import HeroCard from '../../HeroCard'
import { StyledInput } from '../../HeroContainer'
import PrivateTransactionInput from '../../PrivateTransactionInput'
import Lineage from './Lineage'
import SaleHistory from './SaleHistory'
import StatsList from './StatsList'
import WarningBlock from './WarningBlock'

const SellHeroConfirm = ({
  // handleTransactionStyleChange,
  handleTransactionTypeChange,
  privateRecipientProfile,
  privateRecipientAddress,
  saleApproved,
  saleApproveCallback,
  setPrivateRecipientAddress,
  setPrivateRecipientProfile,
  transactionType,
  transactionStyle
}: any) => {
  const { account, chainId } = useActiveWeb3React()
  const dispatch = useDispatch()
  const addTransaction = useTransactionAdder()
  const hero: any = useSelector(s => s.heroHub.heroDetailsModalHero)
  const { sellAmount } = useSelector(s => s.heroHub)
  const [sellConfirm, setSellConfirm] = useState('')
  const saleAuction = getSaleAuctionCore({ account, chainId })
  const [auctionStartPrice, setAuctionStartPrice] = useState(0)
  const [auctionEndPrice, setAuctionEndPrice] = useState(0)
  const [auctionDuration, setAuctionDuration] = useState(7)
  const [transactionProcessing, setTransactionProcessing] = useState(false)

  const handleSellAmountChange = (priceValue: string) => {
    const price = Number(priceValue)
    dispatch(setSellAmount(price))
    setAuctionStartPrice(price)
    setAuctionEndPrice(price)
  }

  const handleStartPriceChange = (price: string) => {
    setAuctionStartPrice(Number(price))
  }

  const handleEndPriceChange = (price: string) => {
    setAuctionEndPrice(Number(price))
  }

  const handleDurationChange = (days: string) => {
    let duration = Number(days)
    if (duration > 365) {
      duration = 365
    }

    setAuctionDuration(duration)
  }

  const handleConfirmSell = async () => {
    setTransactionProcessing(true)
    let startingPrice = sellAmount
    let endingPrice = sellAmount
    let duration = 60

    if (transactionStyle === 'auction' && transactionType === 'public') {
      startingPrice = auctionStartPrice
      endingPrice = auctionEndPrice
      duration = Number(auctionDuration) * 3600 * 24
    }

    if (hero && saleAuction && startingPrice > 0) {
      try {
        const heroId = hero.id
        const args = [
          heroId,
          utils.parseEther(startingPrice.toString()),
          utils.parseEther(endingPrice.toString()),
          duration,
          privateRecipientAddress ? privateRecipientAddress : ZERO_ADDRESS
        ] as const

        const response = isHarmonyHook(chainId)
          ? await saleAuction.createAuction(...args, setGas())
          : await saleAuction.createAuction(...args)

        addTransaction(response, {
          summary: `Sell Hero`
        })

        await response.wait(1).then(() => {
          const newData = {
            ...hero,
            price: sellAmount,
            winner: privateRecipientAddress ? { id: privateRecipientAddress } : null
          }

          if (transactionStyle === 'auction' && transactionType === 'public') {
            newData.auction = {
              onAuction: true,
              startingPrice,
              endingPrice,
              duration,
              startedAt: new Date().getTime() / 1000
            }
          }

          dispatch(updateHero(newData))
          dispatch(setShowHeroDetailsModal(false))
        })
      } catch (error) {
        errorHandler(error)
      }
    }

    setTransactionProcessing(false)
  }

  // const [auctionDirection, setAuctionDirection] = useState('decrease')

  // useEffect(() => {
  //   handleTransactionTypeChange('public')
  //   handleTransactionStyleChange('fixed')
  // }, [])

  // useEffect(() => {
  //   if (sellAmount > 0) {
  //     handleStartPriceChange(sellAmount)
  //     handleEndPriceChange(sellAmount)
  //   }
  // }, [sellAmount])

  // useEffect(() => {
  //   const startPrice = Number(auctionStartPrice)
  //   const endPrice = Number(auctionEndPrice)
  //   if (startPrice > endPrice) {
  //     setAuctionDirection('decrease')
  //   }

  //   if (startPrice < endPrice) {
  //     setAuctionDirection('increase')
  //   }
  // }, [auctionStartPrice, auctionEndPrice])

  // const priceChange = calculatePriceChangeOverTime(auctionStartPrice, auctionEndPrice, auctionDuration * 24 * 3600)

  return (
    <>
      {hero && (
        <HeroSaleGrid>
          <SellBlock>
            <SellHeader>
              <div>
                <FormLabel component="legend">Sale Type</FormLabel>
                <RadioWrapper>
                  <RadioGroup aria-label="sale-type" defaultValue="public" name="radio-buttons-group-audience">
                    <FormControlLabel
                      value="public"
                      control={<Radio color="primary" />}
                      label="Public"
                      onChange={e => handleTransactionTypeChange('public')}
                    />
                    <FormControlLabel
                      value="private"
                      control={<Radio color="primary" />}
                      label="Private Sale"
                      onChange={e => handleTransactionTypeChange('private')}
                    />
                  </RadioGroup>
                </RadioWrapper>
              </div>

              {/* {transactionType === 'public' && (
                  <div>
                    <FormLabel component="legend">Sale Style</FormLabel>
                    <RadioWrapper>
                      <RadioGroup aria-label="sale-type" defaultValue="fixed" name="radio-buttons-group-style">
                        <FormControlLabel
                          value="fixed"
                          control={<Radio color="primary" />}
                          label="Fixed Price"
                          onChange={e => handleTransactionStyleChange('fixed')}
                        />
                        <FormControlLabel
                          value="auction"
                          control={<Radio color="primary" />}
                          label="Auction"
                          onChange={e => handleTransactionStyleChange('auction')}
                        />
                      </RadioGroup>
                    </RadioWrapper>
                  </div>
                )} */}
              <Divider />

              {(transactionStyle === 'fixed' || transactionType === 'private') && (
                <AuctionForm>
                  <div>
                    <label>Sell Price:</label>
                    <SellHeaderPrice>
                      <CuteJewel style={{ marginLeft: '10px' }} />
                      <input
                        key="sell-amount"
                        value={sellAmount}
                        id="sell-price"
                        type="number"
                        min="0.1"
                        step="0.1"
                        placeholder="0"
                        onChange={e => handleSellAmountChange(e.target.value)}
                      />
                    </SellHeaderPrice>
                  </div>
                </AuctionForm>
              )}

              {transactionStyle === 'auction' && transactionType === 'public' && (
                <div>
                  <AuctionForm>
                    <div>
                      <label>Start Price</label>
                      <SellHeaderPrice>
                        <CuteJewel style={{ marginLeft: '10px' }} />
                        <input
                          key="auction-amount-start"
                          value={auctionStartPrice}
                          id="sell-start-price"
                          type="number"
                          min="0.1"
                          step="0.1"
                          placeholder="0"
                          onChange={e => handleStartPriceChange(e.target.value)}
                        />
                      </SellHeaderPrice>
                    </div>
                    <div>
                      <label>End Price</label>
                      <SellHeaderPrice>
                        <CuteJewel style={{ marginLeft: '10px' }} />
                        <input
                          key="auction-amount-end"
                          value={auctionEndPrice}
                          id="sell-end-price"
                          type="number"
                          min="0.1"
                          step="0.1"
                          placeholder="0"
                          onChange={e => handleEndPriceChange(e.target.value)}
                        />
                      </SellHeaderPrice>
                    </div>
                    <div>
                      <label>Duration:</label>
                      <SellHeaderPrice>
                        <input
                          key="auction-duration"
                          className="days"
                          value={auctionDuration}
                          id="sell-duration"
                          type="number"
                          min={1}
                          max={365}
                          placeholder="0"
                          onChange={e => handleDurationChange(e.target.value)}
                        />
                        <label>Day(s)</label>
                      </SellHeaderPrice>
                    </div>
                  </AuctionForm>

                  {/* {auctionEndPrice !== auctionStartPrice && (
                      <p style={{ fontSize: '12px', lineHeight: '1.6' }}>
                        Price will <strong>{auctionDirection}</strong> by ~<strong>{priceChange} JEWEL</strong> every
                        second for {auctionDuration} day(s)
                      </p>
                    )} */}

                  <p style={{ fontSize: '12px', lineHeight: '1.6', opacity: 0.7 }}>
                    The sale price of your hero will begin at the <strong>Start Price</strong>, and increase or decrease
                    incrementally over the chosen <strong>Duration</strong> until the <strong>End Price</strong> is
                    reached. Your hero will remain listed for sale at the <strong>End Price</strong> until sold or until
                    the sale is cancelled.
                  </p>
                </div>
              )}
            </SellHeader>

            <Divider />

            {transactionType === 'private' && (
              <PrivateTransactionInput
                profile={privateRecipientProfile}
                address={privateRecipientAddress}
                setAddress={setPrivateRecipientAddress}
                setProfile={setPrivateRecipientProfile}
              />
            )}
            <WarningBlock>
              <p style={{ fontSize: 10, lineHeight: 1.4, margin: 0, maxWidth: '50%' }}>
                This will list your Hero <strong>FOR SALE</strong>. When someone buys this Hero, it is no longer yours!
              </p>
              <StyledInput
                type="text"
                placeholder="Type 'SELL'"
                onInput={(e: React.ChangeEvent<HTMLInputElement>) => setSellConfirm(e.target.value)}
              />
            </WarningBlock>
            <HeroSaleGrid>
              <p style={{ marginRight: 16, fontSize: '12px', lineHeight: '1.6', flex: 1, opacity: 0.7 }}>
                The Tavern Marketplace will take a{' '}
                <a
                  href="https://docs.defikingdoms.com/how-defi-kingdoms-works/power-tokens#transactions-and-rewards"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#fff' }}
                >
                  3.75% cut
                </a>{' '}
                of the transaction.
              </p>
              {!saleApproved && (
                <Button
                  style={{ padding: '10px' }}
                  onClick={saleApproveCallback}
                  loading={transactionProcessing}
                  disabled={saleApproved || transactionProcessing}
                  fullWidth
                >
                  Approve Tavern Contract
                </Button>
              )}
              {saleApproved && (
                <Button
                  onClick={handleConfirmSell}
                  style={{ height: 40 }}
                  loading={transactionProcessing}
                  disabled={transactionProcessing || sellConfirm.toLowerCase() !== 'sell'}
                  fullWidth
                >
                  Confirm Sale
                </Button>
              )}
            </HeroSaleGrid>

            <Divider />
            <HeroCard isFlipped={false} hero={hero} />
          </SellBlock>

          <div>
            <BorderedBox noBorder={true} noBackground={true}>
              <StatsList hero={hero} />
            </BorderedBox>

            <BorderedBox>
              <Lineage hero={hero} />
            </BorderedBox>

            <BorderedBox>
              <SaleHistory hero={hero} />
            </BorderedBox>
          </div>
        </HeroSaleGrid>
      )}
    </>
  )
}

export default SellHeroConfirm

const SellHeader = styled.div`
  width: 100%;

  .price {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    margin: 0.5em 0;

    label {
      width: 100%;
      font-size: 12px;
      line-height: 1;
      font-weight: 410;
      margin: 0 0 0.25em;
    }
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;

    .price {
      width: 100%;
    }
  `};
`

const SellBlock = styled.div`
  margin: 0 auto 0;
  padding: 0 1em;
  max-width: 440px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
     max-width: none;
  `};
`

const Divider = styled.hr`
  width: 100%;
  height: 1px;
  background-color: #fac05d4d;
  border: 0;
  margin: 16px 0;
`

const SellHeaderPrice = styled.div`
  background: #212121e8 0% 0% no-repeat padding-box;
  border: 2px solid #fac05d4d;
  border-radius: 8px;
  opacity: 1;
  display: flex;
  align-items: center;
  padding: 6px 12px;
  flex-flow: row nowrap;
  justify-content: space-between;
  font-size: 20px;

  label {
    font-size: 12px;
    line-height: 1;
    font-weight: 400;
  }

  input {
    min-width: 30px;
    max-width: 80px;
    padding: 0;
    background: 0;
    border: 0;
    text-align: center;
    color: white;
    font-size: 20px;
    outline: none;
    font-weight: 700;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &[type='number'] {
      -moz-appearance: textfield;
    }

    &.days {
      max-width: 40px;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    justify-content: center;
  `};
`

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

const RadioWrapper = styled.div`
  .MuiFormGroup-root {
    display: flex;
    flex-flow: row wrap;

    .MuiFormControlLabel-label {
      margin-right: 0.5em;
    }
  }
`

const AuctionForm = styled.div`
  display: flex;
  flex-flow: row wrap;

  label {
    font-size: 12px;
    line-height: 1;
    font-weight: 400;
    margin: 00 0.25em;
  }

  > div {
    margin-right: 0.5em;

    &:last-child {
      margin-right: 0;
    }
  }
`
