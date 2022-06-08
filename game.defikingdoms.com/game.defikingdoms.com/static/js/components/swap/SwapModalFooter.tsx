import { useContext, useMemo, useState } from 'react'
import { Repeat } from 'react-feather'
import { Button } from 'components/Buttons'
import { BANK_SETTINGS } from 'constants/index'
import { Trade, TradeType } from 'constants/sdk-extra'
import { Field } from 'features/swap/actions'
import { getChainId } from 'features/web3/utils'
import useBlockchain from 'hooks/useBlockchain'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { TYPE } from 'theme'
import getBlockchainAdjustedCurrency from 'utils/getBlockchainAdjustedCurrency'
import {
  computeSlippageAdjustedAmounts,
  computeTradePriceBreakdown,
  formatBlockchainAdjustedExecutionPrice,
  warningSeverity
} from 'utils/prices'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import FormattedPriceImpact from './FormattedPriceImpact'
import { StyledBalanceMaxMini, SwapCallbackError } from './styleds'

export default function SwapModalFooter({
  trade,
  onConfirm,
  allowedSlippage,
  swapErrorMessage,
  disabledConfirm
}: {
  trade: Trade
  allowedSlippage: number
  onConfirm: () => void
  swapErrorMessage: string | undefined
  disabledConfirm: boolean
}) {
  const chainId = getChainId()
  const bankSettings = chainId ? BANK_SETTINGS[chainId] : undefined
  const blockchain = useBlockchain()
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const theme = useContext(ThemeContext)
  const slippageAdjustedAmounts = useMemo(
    () => computeSlippageAdjustedAmounts(trade, allowedSlippage),
    [allowedSlippage, trade]
  )
  const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const severity = warningSeverity(priceImpactWithoutFee)
  const tradeInputCurrency = getBlockchainAdjustedCurrency(blockchain, trade.inputAmount.currency, chainId)
  const tradeOutputCurrency = getBlockchainAdjustedCurrency(blockchain, trade.outputAmount.currency, chainId)
  return (
    <>
      <AutoColumn gap="0px">
        <RowBetween align="center">
          <Text fontWeight={400} fontSize={16} color={theme.text2}>
            Price
          </Text>
          <Text
            fontWeight={500}
            fontSize={16}
            color={theme.text1}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
              textAlign: 'right',
              paddingLeft: '10px'
            }}
          >
            {formatBlockchainAdjustedExecutionPrice(trade, tradeInputCurrency, tradeOutputCurrency, showInverted)}
            <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
              <Repeat size={14} />
            </StyledBalanceMaxMini>
          </Text>
        </RowBetween>

        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={16} fontWeight={400} color={theme.text2}>
              {trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}
            </TYPE.black>
            <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
          </RowFixed>
          <RowFixed>
            <TYPE.black fontSize={16}>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? '-'
                : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? '-'}
            </TYPE.black>
            <TYPE.black fontSize={16} marginLeft={'4px'}>
              {trade.tradeType === TradeType.EXACT_INPUT ? tradeOutputCurrency?.symbol : tradeInputCurrency?.symbol}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <TYPE.black color={theme.text2} fontSize={16} fontWeight={400}>
              Price Impact
            </TYPE.black>
            <QuestionHelper text="The difference between the market price and your price due to trade size." />
          </RowFixed>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={16} fontWeight={400} color={theme.text2}>
              Liquidity Provider Fee
            </TYPE.black>
            <QuestionHelper
              text={`A portion of each trade (0.30%) goes to liquidity providers and ${bankSettings?.name} stakers as a protocol incentive.`}
            />
          </RowFixed>
          <TYPE.black fontSize={16}>
            {realizedLPFee ? realizedLPFee?.toSignificant(6) + ' ' + tradeInputCurrency?.symbol : '-'}
          </TYPE.black>
        </RowBetween>
      </AutoColumn>

      <AutoRow>
        <Button
          style={{ padding: '8px' }}
          containerStyle={{ margin: '10px 0 0 0' }}
          onClick={onConfirm}
          disabled={disabledConfirm}
          error={severity > 2}
          id="confirm-swap-or-send"
          fullWidth
        >
          <Text fontSize={16} fontWeight={500}>
            {severity > 2 ? 'Swap Anyway' : 'Confirm Swap'}
          </Text>
        </Button>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}
