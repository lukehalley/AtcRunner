import { useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Card from 'components/Card'
import { AutoColumn } from 'components/Column'
import { ButtonSecondary } from 'components/JitterButtons'
import { SwapPoolTabs } from 'components/NavigationTabs'
import FullPositionCard from 'components/PositionCard/FullPositionCard'
import { RowBetween } from 'components/Row'
import { DKModal } from 'components/_DeFiKingdoms/DKModal'
import { CardSection, DataCard } from 'components/earn/styled'
import { Dots } from 'components/swap/styleds'
import { BIG_INT_ZERO } from 'constants/index'
import { Blockchain, JSBI, Pair } from 'constants/sdk-extra'
import { useStakingInfo } from 'features/stake/hooks'
import { toV2LiquidityToken, useTrackedTokenPairs } from 'features/user/hooks'
import { useTokenBalancesWithLoadingIndicator } from 'features/wallet/hooks'
import { getAccount, getChainId } from 'features/web3/utils'
import useBlockchain from 'hooks/useBlockchain'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components/macro'
import { StyledInternalLink, ExternalLink, HideSmall, TYPE } from 'theme'
import baseCurrencies from 'utils/baseCurrencies'
import { usePairs } from 'utils/data/Reserves'
import { useUserHasLiquidityInAllTokens } from 'utils/data/V1'

interface DruidPoolModalProps {
  npcName: string
  npcText: string
  setShowPoolModal: Function
  showPoolModal: boolean
}

const DruidPoolModal = ({ npcName, npcText, setShowPoolModal, showPoolModal }: DruidPoolModalProps) => {
  const theme = useContext(ThemeContext)
  const account = getAccount()
  const chainId = getChainId()
  const blockchain = useBlockchain()
  const baseCurrency = baseCurrencies(chainId)[0]
  const addLiquidityUrl = `/add/${baseCurrency.symbol}`
  const createPoolUrl = `/create/${baseCurrency.symbol}`

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )

  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens]
  )

  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(
        ({ liquidityToken }) => liquidityToken && v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some(V2Pair => !V2Pair)
  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  const hasV1Liquidity = useUserHasLiquidityInAllTokens()

  // show liquidity even if its deposited in rewards contract
  const stakingInfo = useStakingInfo(true)
  const stakingInfosWithBalance = stakingInfo?.filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
  const stakingPairs = usePairs(stakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens))

  // remove any pairs that also are included in pairs with stake in mining pool
  const v2PairsWithoutStakedAmount = allV2PairsWithLiquidity.filter(v2Pair => {
    return (
      stakingPairs
        ?.map(stakingPair => stakingPair[1])
        .filter(stakingPair => stakingPair?.liquidityToken.address === v2Pair.liquidityToken.address).length === 0
    )
  })

  return (
    <DKModal title="Liquidity Pools" showModal={showPoolModal} setShowModal={setShowPoolModal} maxWidth={640}>
      <div className="dialog-flex">
        <div className="bordered-box-thin">
          <div className="dk-modal--npc-text">
            <h4>{npcName}</h4>
            <p>{npcText}</p>
          </div>
        </div>
        {account && (
          <div className="bordered-box-thin" style={{ display: 'flex', alignItems: 'center' }}>
            <ul style={{ marginBottom: '0rem' }} className="dialog-menu">
              <li>
                <Link to={createPoolUrl}>Create Pool</Link>
              </li>

              <li>
                <Link to={addLiquidityUrl}>Buy Seeds</Link>
              </li>
            </ul>
          </div>
        )}
      </div>

      <SwapPoolTabs active={'pool'} />
      <VoteCard>
        <CardSection>
          <AutoColumn gap="md">
            <RowBetween>
              <TYPE.white fontWeight={600}>Liquidity Provider Rewards</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.white fontSize={17}>
                {`Liquidity providers earn a 0.2% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.`}
              </TYPE.white>
            </RowBetween>
            {blockchain === Blockchain.ETHEREUM && (
              <ExternalLink
                style={{ color: 'white', textDecoration: 'underline' }}
                target="_blank"
                href="https://uniswap.org/docs/v2/core-concepts/pools/"
              >
                <TYPE.white fontSize={16}>Read more about providing liquidity</TYPE.white>
              </ExternalLink>
            )}
          </AutoColumn>
        </CardSection>
      </VoteCard>

      <AutoColumn gap="lg" justify="center">
        <AutoColumn gap="lg" style={{ width: '100%' }}>
          <TitleRow style={{ marginTop: '1rem' }} padding={'0'}>
            <HideSmall>
              <TYPE.largeHeader style={{ marginTop: '0.5rem', justifySelf: 'flex-start' }}>
                Your liquidity
              </TYPE.largeHeader>
            </HideSmall>
          </TitleRow>

          {!account ? (
            <Card padding="40px">
              <TYPE.body color={theme.text3} textAlign="center">
                Connect to a wallet to view your liquidity.
              </TYPE.body>
            </Card>
          ) : v2IsLoading ? (
            <EmptyProposals>
              <TYPE.body color={theme.text3} textAlign="center">
                <Dots>Loading</Dots>
              </TYPE.body>
            </EmptyProposals>
          ) : allV2PairsWithLiquidity?.length > 0 || stakingPairs?.length > 0 ? (
            <>
              {blockchain === Blockchain.ETHEREUM && (
                <ButtonSecondary>
                  <RowBetween>
                    <ExternalLink href={'https://uniswap.info/account/' + account}>
                      Account analytics and accrued fees
                    </ExternalLink>
                    <span> ↗</span>
                  </RowBetween>
                </ButtonSecondary>
              )}
              {v2PairsWithoutStakedAmount.map(v2Pair => (
                <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
              ))}
              {stakingPairs.map(
                (stakingPair, i) =>
                  stakingPair[1] && ( // skip pairs that arent loaded
                    <FullPositionCard
                      key={stakingInfosWithBalance[i].pid}
                      pair={stakingPair[1]}
                      stakedBalance={stakingInfosWithBalance[i].stakedAmount}
                    />
                  )
              )}
            </>
          ) : (
            <EmptyProposals>
              <TYPE.body color={theme.text3} textAlign="center">
                No liquidity found.
              </TYPE.body>
            </EmptyProposals>
          )}

          <AutoColumn justify={'center'} gap="md">
            <Text textAlign="center" fontSize={17} style={{ padding: '.5rem 0 .5rem 0' }}>
              {hasV1Liquidity ? 'DefiKingdoms V1 liquidity found!' : "Don't see a pool you joined?"}{' '}
              <StyledInternalLink id="import-pool-link" to={hasV1Liquidity ? '/migrate/v1' : '/find'}>
                {hasV1Liquidity ? 'Migrate now.' : 'Import it.'}
              </StyledInternalLink>
            </Text>
          </AutoColumn>
        </AutoColumn>
      </AutoColumn>
    </DKModal>
  )
}

export default DruidPoolModal

const VoteCard = styled(DataCard)`
  border-radius: 0;
  // background: radial-gradient(
  //   76.02% 75.41% at 1.84% 0%,
  //   ${({ theme }) => theme.customCardGradientStart} 0%,
  //   ${({ theme }) => theme.customCardGradientEnd} 100%
  // );
  background: rgba(0, 0, 0, 0.85);
  overflow: hidden;
`

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`

const EmptyProposals = styled.div`
  border: 1px solid ${({ theme }) => theme.text4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
