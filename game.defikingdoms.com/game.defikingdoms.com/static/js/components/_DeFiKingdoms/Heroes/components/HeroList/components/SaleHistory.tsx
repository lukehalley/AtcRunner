import { useEffect } from 'react'
import CuteJewel from 'components/CuteJewel'
import { utils } from 'ethers'
import { fetchHeroSaleHistory, setHeroSaleHistory } from 'features/heroes/state'
import { useDispatch, useSelector } from 'features/hooks'
import { useActiveWeb3React } from 'hooks'
import moment from 'moment'
import styled, { css } from 'styled-components/macro'
import midJewel from 'assets/images/mid-jewel.png'

interface SaleHistoryProps {
  hero: any
}
const formatHash = (wallet: any) => {
  const walletChars = wallet.split('')
  const reversedChars = walletChars.slice().reverse()
  const shortenedHash = `${walletChars[0]}${walletChars[1]}${walletChars[2]}${walletChars[2]}${walletChars[3]}...${reversedChars[3]}${reversedChars[2]}${reversedChars[1]}${reversedChars[0]}`
  return shortenedHash
}

const BuyerSeller = ({ name, wallet, type }: any) => {
  return (
    <BuyerSellerContainer className={`${type}-entry`}>
      <BuyerSellerName>{name}</BuyerSellerName>
      {wallet && <BuyerSellerWallet>{formatHash(wallet)}</BuyerSellerWallet>}
    </BuyerSellerContainer>
  )
}

const Transaction = ({ price, date }: any) => {
  return (
    <TransactionWrapper>
      <CuteJewel style={{ width: 10 }} />
      <TransactionPrice>{price}</TransactionPrice>
      <TransactionDate>{moment.unix(date).format('MM/DD/YYYY')}</TransactionDate>
    </TransactionWrapper>
  )
}

const SaleHistory = ({ hero }: SaleHistoryProps) => {
  const dispatch = useDispatch()
  const { account, chainId } = useActiveWeb3React()
  const { heroSaleHistory } = useSelector(s => s.heroes)

  useEffect(() => {
    if (chainId && account && hero.id) {
      hero?.id && dispatch(fetchHeroSaleHistory({ tokenId: String(hero.id) }))
    }

    return () => {
      dispatch(setHeroSaleHistory([]))
    }
  }, [hero?.id, chainId, account, dispatch])

  return (
    <>
      <SaleHistoryContainer>
        <TitleWithJewelHr>Sale History</TitleWithJewelHr>
        {heroSaleHistory?.length ? (
          <SaleHistoryInnerContainer>
            <Column>
              <ColumnTitle>Buyer</ColumnTitle>
              {heroSaleHistory &&
                heroSaleHistory.map((history: any, index: number) => {
                  if (
                    history.endedAt === null ||
                    history.winner === null ||
                    history.seller === null ||
                    history.endingPrice === null
                  )
                    return
                  return (
                    <BuyerSeller key={index} type={'buyer'} name={history.winner.name} wallet={history.winner.id} />
                  )
                })}
            </Column>
            <Column>
              <ColumnTitle>Seller</ColumnTitle>
              {heroSaleHistory &&
                heroSaleHistory.map((history: any, index: any) => {
                  if (
                    history.endedAt === null ||
                    history.winner === null ||
                    history.seller === null ||
                    history.endingPrice === null
                  )
                    return
                  return (
                    <BuyerSeller key={index} type={'seller'} name={history.seller.name} wallet={history.seller.id} />
                  )
                })}
            </Column>
            <Column>
              <ColumnTitleSpacer>Empty</ColumnTitleSpacer>
              {heroSaleHistory.map((history: any, index: any) => {
                if (
                  history.endedAt === null ||
                  history.winner === null ||
                  history.seller === null ||
                  history.endingPrice === null
                )
                  return
                return <Transaction key={index} price={utils.formatEther(history.endingPrice)} date={history.endedAt} />
              })}
            </Column>
          </SaleHistoryInnerContainer>
        ) : (
          <WowSuchEmpty>Wow, such empty...</WowSuchEmpty>
        )}
      </SaleHistoryContainer>
    </>
  )
}

export default SaleHistory

const COMMON_TEXT_STYLES = css`
  color: #ffffff;
  text-shadow: 1px 2px 1px #100f21;
  text-align: left;
  opacity: 0.8;
  letter-spacing: 0px;
`
const TransactionPrice = styled.span`
  ${COMMON_TEXT_STYLES}
  font: normal normal bold 14px/16px Poppins;
  font-family: Poppins, sans-serif;
`

const TransactionDate = styled.span`
  ${COMMON_TEXT_STYLES}
  display: block;
  font: normal normal normal 12px/14px Lora;
  font-family: Lora, sans-serif;
`

const TransactionWrapper = styled.div`
  height: 60px;
  padding-top: 10px; /* changed from 6.5 to better align with other column contents */
  padding-bottom: 6.5px;
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
  justify-content: space-between;
  flex-direction: row;
  padding-bottom: 10px;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const ColumnTitle = styled.span`
  ${COMMON_TEXT_STYLES}
  display: block;
  font: 'normal normal normal 16px/19px Lora';
  font-family: 'Lora, serif';
  opacity: 0.5;
`

const ColumnTitleSpacer = styled.span`
  ${COMMON_TEXT_STYLES}
  display: block;
  font: 'normal normal normal 16px/19px Lora';
  font-family: 'Lora, serif';
  opacity: 0;
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
const BuyerSellerContainer = styled.div`
  padding-top: 6.5px;
  padding-bottom: 6.5px;
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`

const BuyerSellerName = styled.span`
  ${COMMON_TEXT_STYLES}
  padding-top: 5px;
  display: block;
  font: normal normal normal 12px/14px Lora;
  font-family: Lora;
`

const BuyerSellerWallet = styled.span`
  ${COMMON_TEXT_STYLES}
  display: block;
  font: 'normal normal normal 12px/14px Lora';
  font-family: 'Lora, sans-serif';
`
