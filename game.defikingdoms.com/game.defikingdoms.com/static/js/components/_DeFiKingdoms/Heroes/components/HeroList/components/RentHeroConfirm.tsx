import { useState } from 'react'
import { TransactionResponse } from '@ethersproject/providers'
// import { FormControlLabel, Checkbox, FormControl, FormGroup } from '@material-ui/core'
// import { makeStyles } from '@material-ui/core/styles'
import { Button } from 'components/Buttons'
import CuteJewel from 'components/CuteJewel'
import { ZERO_ADDRESS } from 'constants/index'
import { utils } from 'ethers'
import { setShowHeroDetailsModal } from 'features/heroHub/state'
import { updateHero } from 'features/heroes/state'
import { useDispatch, useSelector } from 'features/hooks'
import { useTransactionAdder } from 'features/transactions/hooks'
import { useActiveWeb3React } from 'hooks'
import styled from 'styled-components/macro'
import { isHarmonyHook, setGas } from 'utils'
import { getAssistingAuctionCore } from 'utils/contracts'
import errorHandler from 'utils/errorHandler'
import HeroCard from '../../HeroCard'
import { StyledInput } from '../../HeroContainer'
// import PrivateTransactionInput from '../../PrivateTransactionInput'
import Lineage from './Lineage'
import SaleHistory from './SaleHistory'
import StatsList from './StatsList'
import WarningBlock from './WarningBlock'

// MUI Theme
// const useStyles = makeStyles(theme => ({
//   root: {
//     width: '100%',
//     display: 'flex'
//   },
//   formControl: {
//     margin: theme.spacing(3, 1),
//     width: '100%'
//   },
//   formGroup: {
//     width: '100%',
//     flexDirection: 'row',
//     [theme.breakpoints.down('xs')]: {
//       justifyContent: 'center'
//     },

//     '& .MuiFormLabel-root': {
//       width: '100%'
//     },
//     '& .MuiFormControlLabel-root': {
//       '& .MuiSvgIcon-root': {
//         color: 'green',
//         width: '18px',
//         height: '18px'
//       },
//       '& .MuiTypography-root': {
//         fontSize: '14px'
//       }
//     }
//   }
// }))

const RentHeroConfirm = ({
  handleTransactionTypeChange,
  privateRecipientProfile,
  privateRecipientAddress,
  saleApproved,
  saleApproveCallback,
  setPrivateRecipientAddress,
  setPrivateRecipientProfile,
  transactionType
}: any) => {
  // const classes = useStyles()
  const { account, chainId } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()
  const dispatch = useDispatch()
  const { rentAmount } = useSelector(s => s.heroHub)
  const hero: any = useSelector(s => s.heroHub.heroDetailsModalHero)
  const assistingAuctionCore = getAssistingAuctionCore({ account, chainId })
  const [hireConfirm, setHireConfirm] = useState('')
  const [transactionProcessing, setTransactionProcessing] = useState(false)

  const handleConfirmRental = async () => {
    setTransactionProcessing(true)
    if (hero && assistingAuctionCore && rentAmount > 0) {
      try {
        const heroId = hero.id
        const args = [
          heroId,
          utils.parseEther(rentAmount.toString()),
          utils.parseEther(rentAmount.toString()),
          60,
          privateRecipientAddress ? privateRecipientAddress : ZERO_ADDRESS
        ] as const
        const response: TransactionResponse = isHarmonyHook(chainId)
          ? await assistingAuctionCore.createAuction(...args, setGas())
          : await assistingAuctionCore.createAuction(...args)

        addTransaction(response, {
          summary: `Rent out Hero`
        })

        await response.wait(1).then(receipt => {
          const newData = {
            ...hero,
            summoningPrice: rentAmount,
            winner: privateRecipientAddress ? { id: privateRecipientAddress } : null
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

  return (
    <>
      {hero && (
        <HeroRentGrid>
          <div>
            <RentalHeader>
              <div className="price">
                <RentalHeaderPrice>
                  <CuteJewel />
                  <span>{rentAmount}</span>
                </RentalHeaderPrice>
              </div>

              {/* <FormControl component="fieldset" className={classes.formControl}>
                  <FormGroup className={classes.formGroup}>
                    <FormControlLabel
                      key={'transaction-type-auction'}
                      control={
                        <Checkbox
                          checked={transactionType === 'public'}
                          onChange={e => handleTransactionTypeChange('public')}
                          name={'public'}
                        />
                      }
                      label={'Public'}
                    />
                    <FormControlLabel
                      key={'transaction-type-private'}
                      control={
                        <Checkbox
                          checked={transactionType === 'private'}
                          onChange={e => handleTransactionTypeChange('private')}
                          name={'private'}
                        />
                      }
                      label={'Private'}
                    />
                  </FormGroup>
                </FormControl> */}
            </RentalHeader>

            {/* {transactionType === 'private' && (
                <PrivateTransactionInput
                  profile={privateRecipientProfile}
                  address={privateRecipientAddress}
                  setAddress={setPrivateRecipientAddress}
                  setProfile={setPrivateRecipientProfile}
                />
              )} */}

            <HeroRentGrid>
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
                  onClick={handleConfirmRental}
                  style={{ height: 40 }}
                  loading={transactionProcessing}
                  disabled={transactionProcessing || hireConfirm.toLowerCase() !== 'hire'}
                  fullWidth
                >
                  Confirm Rental
                </Button>
              )}
            </HeroRentGrid>
            <WarningBlock backgroundColor="rgba(18, 85, 131, 1)">
              <p style={{ fontSize: 10, lineHeight: 1.4, margin: 0 }}>
                When your hero is hired, their remaining summons will decrease by one.
              </p>
              <StyledInput
                type="text"
                placeholder="Type 'HIRE'"
                onInput={(e: React.ChangeEvent<HTMLInputElement>) => setHireConfirm(e.target.value)}
              />
            </WarningBlock>
            <hr style={{ width: '100%', height: '1px', backgroundColor: '#70707086', border: 0, margin: '24px 0' }} />
            <HeroCard isFlipped={false} hero={hero} />
          </div>

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
        </HeroRentGrid>
      )}
    </>
  )
}

export default RentHeroConfirm

const RentalHeader = styled.div`
  display: flex;

  align-items: center;
  width: 100%;

  .price {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;

    .price {
      width: 100%;
    }
  `};
`

const RentalHeaderPrice = styled.div`
  background: #212121e8 0% 0% no-repeat padding-box;
  border: 2px solid #fac05d4d;
  border-radius: 8px;
  opacity: 1;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  flex-flow: row nowrap;
  justify-content: space-between;
  font-size: 20px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 20px;
    width: 100%;
    justify-content: center;
  `};
`

const HeroRentGrid = styled.div`
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
