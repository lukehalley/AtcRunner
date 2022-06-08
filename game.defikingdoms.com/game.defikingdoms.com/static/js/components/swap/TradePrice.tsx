import { useContext } from 'react'
import { Repeat } from 'react-feather'
import { Price } from 'constants/sdk-extra'
import { getChainId } from 'features/web3/utils'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import useBlockchain from '../../hooks/useBlockchain'
import getBlockchainAdjustedCurrency from '../../utils/getBlockchainAdjustedCurrency'
import { StyledBalanceMaxMini } from './styleds'

interface TradePriceProps {
  price?: Price
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
}

export default function TradePrice({ price, showInverted, setShowInverted }: TradePriceProps) {
  const chainId = getChainId()
  const theme = useContext(ThemeContext)
  const blockchain = useBlockchain()

  const formattedPrice = showInverted ? price?.toSignificant(6) : price?.invert()?.toSignificant(6)

  const show = Boolean(price?.baseCurrency && price?.quoteCurrency)

  const quoteCurrency = getBlockchainAdjustedCurrency(blockchain, price?.quoteCurrency, chainId)
  const baseCurrency = getBlockchainAdjustedCurrency(blockchain, price?.baseCurrency, chainId)

  const label = showInverted
    ? `${quoteCurrency?.symbol} per ${baseCurrency?.symbol}`
    : `${baseCurrency?.symbol} per ${quoteCurrency?.symbol}`

  return (
    <Text
      fontWeight={500}
      fontSize={17}
      color={theme.text2}
      style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}
    >
      {show ? (
        <>
          {formattedPrice ?? '-'} {label}
          <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
            <Repeat size={14} />
          </StyledBalanceMaxMini>
        </>
      ) : (
        '-'
      )}
    </Text>
  )
}
