import { useEffect, useMemo, useState } from 'react'
import { Interface } from '@ethersproject/abi'
import { CurrencyAmount, JSBI, Token, TokenAmount, Pair, Fraction, Currency } from 'constants/sdk-extra'
import isEqual from 'lodash/isEqual'
import { getGardenerMethod, isDFKChainHook } from 'utils'
import IUniswapV2PairABI from '../../constants/abis/IUniswapV2Pair.json'
import { useActiveWeb3React } from '../../hooks'
import useBUSDPrice from '../../hooks/useBUSDPrice'
import { useMasterGardenerContract } from '../../hooks/useContract'
import useFilterStakingRewardsInfo from '../../hooks/useFilterStakingRewardsInfo'
import useGovernanceToken from '../../hooks/useGovernanceToken'
import useTokensWithWETHPrices from '../../hooks/useTokensWithWETHPrices'
import calculateApr from '../../utils/calculateApr'
import calculateWethAdjustedTotalStakedAmount from '../../utils/calculateWethAdjustedTotalStakedAmount'
import determineBaseToken from '../../utils/determineBaseToken'
import getBlocksPerYear from '../../utils/getBlocksPerYear'
import validStakingInfo from '../../utils/validStakingInfo'
import { useBlockNumber } from '../application/hooks'
import { useSingleCallResult, useSingleContractMultipleData } from '../multicall/hooks'
import { useMultipleContractSingleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'

const PAIR_INTERFACE = new Interface(IUniswapV2PairABI)

export const STAKING_GENESIS = 6502000

export const REWARDS_DURATION_DAYS = 60
export interface StakingInfo {
  // the pool id (pid) of the pool
  pid: number
  // the tokens involved in this pair
  tokens: [Token, Token]
  // baseToken used for TVL & APR calculations
  baseToken: Token | undefined
  // the allocation point for the given pool
  allocPoint: JSBI
  // start block for all the rewards pools
  startBlock: number
  // base rewards per block
  baseRewardsPerBlock: TokenAmount
  // pool specific rewards per block
  poolRewardsPerBlock: TokenAmount
  // blocks generated per year
  blocksPerYear: JSBI
  // pool share vs all pools
  poolShare: Fraction
  // the percentage of rewards locked
  lockedRewardsPercentageUnits: number
  // the percentage of rewards locked
  unlockedRewardsPercentageUnits: number
  // the total supply of lp tokens in existence
  totalLpTokenSupply: TokenAmount
  // the amount of currently total staked tokens in the pool
  totalStakedAmount: TokenAmount
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount
  // the ratio of the user's share of the pool
  stakedRatio: Fraction
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account - which will be locked
  lockedEarnedAmount: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account - which will be unlocked
  unlockedEarnedAmount: TokenAmount
  // value of total staked amount, measured in weth
  valueOfTotalStakedAmountInWeth: TokenAmount | Fraction | undefined
  // value of total staked amount, measured in a USD stable coin (busd, usdt, usdc or a mix thereof)
  valueOfTotalStakedAmountInUsd: Fraction | undefined
  // pool APR
  apr: Fraction | undefined
  // if pool is active
  active: boolean
  nextEpochBlock: number
  currentBlock: number
}

// gets the staking info from the network for the active chain id
export function useStakingInfoMemo(
  active: boolean | undefined = undefined,
  pairToFilterBy?: Pair | null
): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()
  const masterGardenerContract = useMasterGardenerContract()

  const masterInfo = useFilterStakingRewardsInfo(chainId, active, pairToFilterBy)

  const tokensWithPrices = useTokensWithWETHPrices()

  const weth = tokensWithPrices?.WETH?.token
  const wethBusdPrice = useBUSDPrice(weth)
  const govToken = tokensWithPrices?.govToken?.token
  const govTokenWETHPrice = tokensWithPrices?.govToken?.price

  const blocksPerYear = getBlocksPerYear(chainId)

  const pids = useMemo(() => masterInfo.map(({ pid }) => pid), [masterInfo])

  const pidAccountMapping = useMemo(
    () => masterInfo.map(({ pid }) => (account ? [pid, account] : [undefined, undefined])),
    [masterInfo, account]
  )

  const pendingRewards = useSingleContractMultipleData(masterGardenerContract, 'pendingReward', pidAccountMapping)
  const userInfos = useSingleContractMultipleData(masterGardenerContract, 'userInfo', pidAccountMapping)

  const poolInfos = useSingleContractMultipleData(
    masterGardenerContract,
    'poolInfo',
    pids.map(pids => [pids])
  )

  const lpTokenAddresses = useMemo(() => {
    return poolInfos.reduce<string[]>((memo, poolInfo) => {
      if (poolInfo && !poolInfo.loading && poolInfo.result) {
        const [lpTokenAddress] = poolInfo.result
        memo.push(lpTokenAddress)
      }
      return memo
    }, [])
  }, [poolInfos])

  const lpTokenTotalSupplies = useMultipleContractSingleData(lpTokenAddresses, PAIR_INTERFACE, 'totalSupply')
  const lpTokenReserves = useMultipleContractSingleData(lpTokenAddresses, PAIR_INTERFACE, 'getReserves')
  const lpTokenBalances = useMultipleContractSingleData(lpTokenAddresses, PAIR_INTERFACE, 'balanceOf', [
    masterGardenerContract?.address
  ])

  // getNewRewardPerBlock uses pid = 0 to return the base rewards
  // poolIds have to be +1'd to map to their actual pid
  // also include pid 0 to get the base emission rate
  let adjustedPids = pids.map(pid => pid + 1)
  adjustedPids = [...[0], ...adjustedPids]

  const rewardMethod = getGardenerMethod(chainId, 'getNewRewardPerSecond', 'getNewRewardPerBlock')
  const poolRewardsPerBlock = useSingleContractMultipleData(
    masterGardenerContract,
    rewardMethod,
    adjustedPids.map(adjustedPids => [adjustedPids])
  )

  //const poolLength = useSingleCallResult(masterGardenerContract, 'poolLength')
  const startMethod = getGardenerMethod(chainId, 'START_TIMESTAMP', 'START_BLOCK')
  const halfMethod = getGardenerMethod(chainId, 'HALVING_AT_TIMESTAMP', 'HALVING_AT_BLOCK')
  const startBlock = useSingleCallResult(masterGardenerContract, startMethod)
  const firstHalvingBlock = useSingleCallResult(masterGardenerContract, halfMethod, [0])
  const firstHalvingBlockValue = firstHalvingBlock.result?.[0] ?? 0
  const currentBlock = useBlockNumber() ?? 0
  const lockRewardsRatio = useSingleCallResult(masterGardenerContract, 'getLockPercentage', [
    currentBlock ? currentBlock : 0,
    currentBlock ? currentBlock + 1 : 1
  ])
  const currentDate = Math.floor(Date.now() / 1000)
  const lockRewardsRatioDFK = useSingleCallResult(masterGardenerContract, 'getLockPercentage', [
    currentDate,
    currentDate + 1
  ])

  return useMemo(() => {
    if (!chainId || !weth || !govToken) return []

    return pids.reduce<StakingInfo[]>((memo, pid, index) => {
      const tokens = masterInfo[index].tokens
      const poolInfo = poolInfos[index]

      // amount uint256, rewardDebt uint256, rewardDebtAtBlock uint256, lastWithdrawBlock uint256, firstDepositBlock uint256, blockdelta uint256, lastDepositBlock uint256
      const userInfo = userInfos[index]
      const pendingReward = pendingRewards[index]
      const lpTokenTotalSupply = lpTokenTotalSupplies[index]
      const lpTokenReserve = lpTokenReserves[index]
      const lpTokenBalance = lpTokenBalances[index]

      // poolRewardsPerBlock indexes have to be +1'd to get the actual specific pool data
      const baseRewardsPerBlock = poolRewardsPerBlock[0]
      const specificPoolRewardsPerBlock = poolRewardsPerBlock[index + 1]

      if (isDFKChainHook(chainId) && typeof lockRewardsRatioDFK.result?.[0] === 'undefined') return []
      if (
        validStakingInfo(
          tokens,
          poolInfo,
          pendingReward,
          userInfo,
          baseRewardsPerBlock,
          specificPoolRewardsPerBlock,
          lockRewardsRatio,
          lpTokenTotalSupply,
          lpTokenReserve,
          lpTokenBalance,
          startBlock
        )
      ) {
        const baseBlockRewards = new TokenAmount(govToken, JSBI.BigInt(baseRewardsPerBlock?.result?.[0] ?? 0))

        const poolBlockRewards = specificPoolRewardsPerBlock?.result?.[0]
          ? new TokenAmount(govToken, JSBI.BigInt(specificPoolRewardsPerBlock?.result?.[0] ?? 0))
          : baseBlockRewards

        const poolShare = new Fraction(poolBlockRewards.raw, baseBlockRewards.raw)

        const lockedRewardsPercentageUnits = isDFKChainHook(chainId)
          ? Number(lockRewardsRatioDFK.result?.[0] ?? 0)
          : Number(lockRewardsRatio.result?.[0] ?? 0)
        const unlockedRewardsPercentageUnits = 100 - lockedRewardsPercentageUnits

        const calculatedTotalPendingRewards = JSBI.BigInt(pendingReward?.result?.[0] ?? 0)
        const calculatedLockedPendingRewards = JSBI.divide(
          JSBI.multiply(calculatedTotalPendingRewards, JSBI.BigInt(lockedRewardsPercentageUnits)),
          JSBI.BigInt(100)
        )
        const calculatedUnlockedPendingRewards = JSBI.divide(
          JSBI.multiply(calculatedTotalPendingRewards, JSBI.BigInt(unlockedRewardsPercentageUnits)),
          JSBI.BigInt(100)
        )

        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'))
        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(userInfo?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(
          dummyPair.liquidityToken,
          JSBI.BigInt(lpTokenBalance.result?.[0] ?? 0)
        )
        const stakedRatio = new Fraction(stakedAmount.raw, totalStakedAmount.raw)

        const totalLpTokenSupply = new TokenAmount(
          dummyPair.liquidityToken,
          JSBI.BigInt(lpTokenTotalSupply.result?.[0] ?? 0)
        )
        const totalPendingRewardAmount = new TokenAmount(govToken, calculatedTotalPendingRewards)
        const totalPendingLockedRewardAmount = new TokenAmount(govToken, calculatedLockedPendingRewards)
        const totalPendingUnlockedRewardAmount = new TokenAmount(govToken, calculatedUnlockedPendingRewards)
        const startsAtBlock = startBlock.result?.[0] ?? 0

        const unitsPerEpoch = isDFKChainHook(chainId) ? 604800 : 302400
        const currentEpoch = isDFKChainHook(chainId)
          ? Math.floor((currentDate - (parseInt(firstHalvingBlockValue) - unitsPerEpoch)) / unitsPerEpoch)
          : currentBlock
          ? Math.floor((currentBlock - (parseInt(firstHalvingBlockValue) - unitsPerEpoch)) / unitsPerEpoch)
          : 0
        const nextEpochBlock = parseInt(firstHalvingBlockValue) + currentEpoch * unitsPerEpoch

        // poolInfo: lpToken address, allocPoint uint256, lastRewardBlock uint256, accGovTokenPerShare uint256
        const poolInfoResult = poolInfo.result
        const allocPoint = JSBI.BigInt(poolInfoResult && poolInfoResult[1])
        const active = poolInfoResult && JSBI.GT(JSBI.BigInt(allocPoint), 0) ? true : false

        const baseToken = determineBaseToken(tokensWithPrices, tokens)

        const totalStakedAmountWETH = calculateWethAdjustedTotalStakedAmount(
          chainId,
          baseToken,
          tokensWithPrices,
          tokens,
          totalLpTokenSupply,
          totalStakedAmount,
          lpTokenReserve?.result
        )

        const totalStakedAmountBUSD =
          wethBusdPrice && totalStakedAmountWETH && totalStakedAmountWETH.multiply(wethBusdPrice?.raw)

        const apr = totalStakedAmountWETH
          ? calculateApr(govTokenWETHPrice, baseBlockRewards, blocksPerYear, poolShare, totalStakedAmountWETH)
          : undefined

        const stakingInfo = {
          pid: pid,
          allocPoint: allocPoint,
          tokens: tokens,
          baseToken: baseToken,
          startBlock: startsAtBlock,
          baseRewardsPerBlock: baseBlockRewards,
          poolRewardsPerBlock: poolBlockRewards,
          blocksPerYear: blocksPerYear,
          poolShare: poolShare,
          lockedRewardsPercentageUnits: lockedRewardsPercentageUnits,
          unlockedRewardsPercentageUnits: unlockedRewardsPercentageUnits,
          totalLpTokenSupply: totalLpTokenSupply,
          totalStakedAmount: totalStakedAmount,
          stakedAmount: stakedAmount,
          stakedRatio: stakedRatio,
          earnedAmount: totalPendingRewardAmount,
          lockedEarnedAmount: totalPendingLockedRewardAmount,
          unlockedEarnedAmount: totalPendingUnlockedRewardAmount,
          valueOfTotalStakedAmountInWeth: totalStakedAmountWETH,
          valueOfTotalStakedAmountInUsd: totalStakedAmountBUSD,
          apr: apr,
          active: active,
          nextEpochBlock: nextEpochBlock,
          currentBlock: currentBlock
        }

        memo.push(stakingInfo)
      }
      return memo
    }, [])
  }, [
    chainId,
    masterInfo,
    tokensWithPrices,
    weth,
    govToken,
    govTokenWETHPrice,
    pids,
    poolInfos,
    userInfos,
    pendingRewards,
    lpTokenTotalSupplies,
    lpTokenReserves,
    lpTokenBalances,
    blocksPerYear,
    startBlock,
    lockRewardsRatio,
    poolRewardsPerBlock
  ])
}

// Wrap the staking info memo hook to prevent updating the state in a transitional phase where an empty array is returned followed by the updated data
export function useStakingInfo(active: boolean | undefined = undefined, pairToFilterBy?: Pair | null): StakingInfo[] {
  const [stakingInfo, setStakingInfo] = useState<StakingInfo[]>([])
  const info: any = useStakingInfoMemo(active, pairToFilterBy)
  useEffect(() => {
    if (info.length !== 0 && !isEqual(info, stakingInfo)) {
      setStakingInfo(info)
    }
  }, [info, stakingInfo])
  return stakingInfo
}

export function useTotalGovTokensEarned(): TokenAmount | undefined {
  const govToken = useGovernanceToken()
  const stakingInfos = useStakingInfo(true)

  return useMemo(() => {
    if (!govToken) return undefined
    try {
      return (
        stakingInfos?.reduce(
          (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmount),
          new TokenAmount(govToken, '0')
        ) ?? new TokenAmount(govToken, '0')
      )
    } catch (error) {
      return undefined
    }
  }, [stakingInfos, govToken])
}

export function useTotalLockedGovTokensEarned(): TokenAmount | undefined {
  const govToken = useGovernanceToken()
  const stakingInfos = useStakingInfo(true)

  return useMemo(() => {
    if (!govToken) return undefined
    try {
      return (
        stakingInfos?.reduce(
          (accumulator, stakingInfo) => accumulator.add(stakingInfo.lockedEarnedAmount),
          new TokenAmount(govToken, '0')
        ) ?? new TokenAmount(govToken, '0')
      )
    } catch (error) {
      return undefined
    }
  }, [stakingInfos, govToken])
}

export function useTotalUnlockedGovTokensEarned(): TokenAmount | undefined {
  const govToken = useGovernanceToken()
  const stakingInfos = useStakingInfo(true)

  return useMemo(() => {
    if (!govToken) return undefined
    try {
      return (
        stakingInfos?.reduce(
          (accumulator, stakingInfo) => accumulator.add(stakingInfo.unlockedEarnedAmount),
          new TokenAmount(govToken, '0')
        ) ?? new TokenAmount(govToken, '0')
      )
    } catch (error) {
      return undefined
    }
  }, [stakingInfos, govToken])
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token | Currency,
  userLiquidityUnstaked: TokenAmount | CurrencyAmount | undefined
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingToken)

  const parsedAmount =
    parsedInput && userLiquidityUnstaked && JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error
  }
}

// based on typed value
export function useDerivedUnstakeInfo(
  typedValue: string,
  stakingAmount: TokenAmount | undefined
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = stakingAmount
    ? tryParseAmount(typedValue, stakingAmount.token)
    : undefined

  const parsedAmount =
    parsedInput && stakingAmount && JSBI.lessThanOrEqual(parsedInput.raw, stakingAmount.raw) ? parsedInput : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error
  }
}
