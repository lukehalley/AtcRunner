import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Button } from 'components/Buttons'
import { BIG_INT_ZERO } from 'constants/index'
import { JSBI, Pair, Percent, TokenAmount } from 'constants/sdk-extra'
import { useTokenBalance } from 'features/wallet/hooks'
import { getAccount } from 'features/web3/utils'
import { useColor } from 'hooks/useColor'
import { darken } from 'polished'
import { transparentize } from 'polished'
import { Text } from 'rebass'
import styled from 'styled-components/macro'
import { currencyId } from 'utils/currencyId'
import { useTotalSupply } from 'utils/data/TotalSupply'
import { unwrappedToken } from 'utils/wrappedCurrency'
import Card, { LightCard } from '../Card'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { ButtonEmpty } from '../JitterButtons'
import { RowBetween, RowFixed, AutoRow } from '../Row'
import { Dots } from '../swap/styleds'

interface FullPositionCardProps {
  pair: Pair
  showUnwrapped?: boolean
  border?: string
  stakedBalance?: TokenAmount // optional balance to indicate that liquidity is deposited in mining pool
}

export default function FullPositionCard({ pair, border, stakedBalance }: FullPositionCardProps) {
  const account = getAccount()
  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)
  const userDefaultPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)

  const [showMore, setShowMore] = useState(false)

  // if staked balance balance provided, add to standard liquidity amount
  const userPoolBalance = stakedBalance ? userDefaultPoolBalance?.add(stakedBalance) : userDefaultPoolBalance

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  const backgroundColor = useColor(pair?.token0)

  return (
    <StyledPositionCard border={border} bgColor={backgroundColor}>
      <AutoColumn gap="12px">
        <FixedHeightRow>
          <AutoRow gap="8px">
            <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={20} />
            <Text fontWeight={500} fontSize={16}>
              {!currency0 || !currency1 ? <Dots>Loading</Dots> : `${currency0.symbol}<>${currency1.symbol}`}
            </Text>
          </AutoRow>
          <RowFixed gap="8px">
            <ButtonEmpty padding="6px 8px" borderRadius="0" width="fit-content" onClick={() => setShowMore(!showMore)}>
              {showMore ? (
                <>
                  Manage
                  <ChevronUp size="20" style={{ marginLeft: '10px' }} />
                </>
              ) : (
                <>
                  Manage
                  <ChevronDown size="20" style={{ marginLeft: '10px' }} />
                </>
              )}
            </ButtonEmpty>
          </RowFixed>
        </FixedHeightRow>

        {showMore && (
          <AutoColumn gap="8px">
            <FixedHeightRow>
              <Text fontSize={16} fontWeight={500}>
                Your total pool tokens:
              </Text>
              <Text fontSize={16} fontWeight={500}>
                {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
              </Text>
            </FixedHeightRow>
            {stakedBalance && (
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500}>
                  Pool tokens in rewards pool:
                </Text>
                <Text fontSize={16} fontWeight={500}>
                  {stakedBalance.toSignificant(4)}
                </Text>
              </FixedHeightRow>
            )}
            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={16} fontWeight={500}>
                  Pooled {currency0.symbol}:
                </Text>
              </RowFixed>
              {token0Deposited ? (
                <RowFixed>
                  <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
                    {token0Deposited?.toSignificant(6)}
                  </Text>
                  <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency0} />
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>

            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={16} fontWeight={500}>
                  Pooled {currency1.symbol}:
                </Text>
              </RowFixed>
              {token1Deposited ? (
                <RowFixed>
                  <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
                    {token1Deposited?.toSignificant(6)}
                  </Text>
                  <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency1} />
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>

            <FixedHeightRow>
              <Text fontSize={16} fontWeight={500}>
                Your pool share:
              </Text>
              <Text fontSize={16} fontWeight={500}>
                {poolTokenPercentage
                  ? (poolTokenPercentage.toFixed(2) === '0.00' ? '<0.01' : poolTokenPercentage.toFixed(2)) + '%'
                  : '-'}
              </Text>
            </FixedHeightRow>

            {userDefaultPoolBalance && JSBI.greaterThan(userDefaultPoolBalance.raw, BIG_INT_ZERO) && (
              <RowBetween marginTop="10px">
                <Button
                  containerStyle={{ width: '48%' }}
                  style={{ padding: '8px' }}
                  to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}
                  fullWidth
                >
                  Create Seeds
                </Button>
                <Button
                  containerStyle={{ width: '48%' }}
                  style={{ padding: '8px' }}
                  to={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`}
                  fullWidth
                >
                  Split Seeds
                </Button>
              </RowBetween>
            )}
            {stakedBalance && JSBI.greaterThan(stakedBalance.raw, BIG_INT_ZERO) && (
              <Button
                style={{ padding: '8px' }}
                to={`/staking/${currencyId(currency0)}/${currencyId(currency1)}`}
                fullWidth
              >
                Manage Liquidity in Rewards Pool
              </Button>
            )}
          </AutoColumn>
        )}
      </AutoColumn>
    </StyledPositionCard>
  )
}

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

export const HoverCard = styled(Card)`
  border: 1px solid transparent;
  :hover {
    border: 1px solid ${({ theme }) => darken(0.06, theme.bg2)};
  }
`
const StyledPositionCard = styled(LightCard)<{ bgColor: any }>`
  border: none;
  background: ${({ theme, bgColor }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${transparentize(0.1, bgColor)} 0%, ${theme.bg3} 10%) `};
  position: relative;
  overflow: hidden;
`
