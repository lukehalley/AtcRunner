import { useState, useEffect } from 'react'
import { ChainId } from 'constants/sdk-extra'
import { useBlockNumber } from 'features/application/hooks'
import { getChainId } from 'features/web3/utils'
import styled, { keyframes } from 'styled-components'
import { TYPE, ExternalLink } from 'theme'
import { getEtherscanLink } from 'utils'
import { YellowCard } from '../Card'

const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: 'Etherium Mainnet',
  [ChainId.RINKEBY]: 'Rinkeby',
  [ChainId.ROPSTEN]: 'Ropsten',
  [ChainId.GÖRLI]: 'Görli',
  [ChainId.KOVAN]: 'Kovan',
  [ChainId.AVALANCHE_C_CHAIN]: 'Avalanche Mainnet',
  [ChainId.AVALANCE_FUJI_TESTNET]: 'Avalanche Testnet',
  [ChainId.DFK_MAINNET]: 'DFK Chain Mainnet',
  [ChainId.DFK_TESTNET]: 'DFK Chain Testnet',
  [ChainId.HARMONY_MAINNET]: 'Harmony Mainnet',
  [ChainId.HARMONY_TESTNET]: 'Harmony Testnet'
}

export default function Polling() {
  const chainId = getChainId()
  const blockNumber = useBlockNumber()
  const [isMounted, setIsMounted] = useState(true)

  const NetworkCard = styled(YellowCard)`
    white-space: nowrap;
    padding: 0.35rem 0.75rem 0.35rem 1rem;
    border-radius: 20px 0 0 20px;
    text-overflow: ellipsis;
    flex-shrink: 1;
    max-width: 160px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.25);
    margin: 0;
    color: ${chainId && (NETWORK_LABELS[chainId] as any) && (NETWORK_LABELS[chainId] as any).includes('Mainnet')
      ? ({ theme }) => theme.green1
      : 'orange'};

    ${({ theme }) => theme.mediaWidth.upToSmall`
      border-radius: 10px 10px 0 0;
      padding: .25rem .5rem;
      max-width: 130px;
      text-align: center;
    `};
  `

  useEffect(
    () => {
      const timer1 = setTimeout(() => setIsMounted(true), 1000)

      // this will clear Timeout when component unmount like in willComponentUnmount
      return () => {
        setIsMounted(false)
        clearTimeout(timer1)
      }
    },
    [blockNumber] //useEffect will run only one time
    //if you pass a value to array, like this [data] than clearTimeout will run every time this value changes (useEffect re-run)
  )

  return (
    <ExternalLink
      href={
        chainId && blockNumber && NETWORK_LABELS[chainId]
          ? getEtherscanLink(chainId, blockNumber.toString(), 'block')
          : ''
      }
    >
      <Wrapper>
        {chainId && NETWORK_LABELS[chainId] ? (
          <NetworkCard fontSize={10} title={NETWORK_LABELS[chainId]}>
            {NETWORK_LABELS[chainId]}
          </NetworkCard>
        ) : (
          <NetworkCard fontSize={10} title="Misc Chain">
            Misc Chain
          </NetworkCard>
        )}
        <StyledPolling>
          <TYPE.small fontSize={10} style={{ opacity: isMounted ? '0.5' : '0.8' }}>
            {blockNumber || 0}
          </TYPE.small>
          <StyledPollingDot>{!isMounted && <Spinner />}</StyledPollingDot>
        </StyledPolling>
      </Wrapper>
    </ExternalLink>
  )
}

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const Wrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  position: fixed;
  bottom: 0;
  right: 0;

  ${({ theme }) => theme.mediaWidth.upToSmall`
  flex-flow: row wrap;
  justify-content: flex-end;
  width: 130px;
  bottom: .5rem;
  right: .5rem;
`};
`

const StyledPolling = styled.div`
  display: flex;
  padding: 0.35rem 0.75rem 0.35rem 1rem;
  color: white;
  transition: opacity 0.25s ease;
  color: ${({ theme }) => theme.green1};
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0 20px 20px 0;
  margin: 0 2rem 2rem 0;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-left: 0;

  :hover {
    opacity: 1;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    border-radius: 0 0 10px 10px;
    padding: .15rem .5rem .25rem;
    width: 100%;
    margin: 0;
    justify-content: center;
  `};
`
const StyledPollingDot = styled.div`
  width: 8px;
  height: 8px;
  min-height: 8px;
  min-width: 8px;
  margin-left: 0.5rem;
  margin-top: 3px;
  border-radius: 50%;
  position: relative;
  background-color: ${({ theme }) => theme.green1};
`

const Spinner = styled.div`
  animation: ${rotate360} 1s cubic-bezier(0.83, 0, 0.17, 1) infinite;
  transform: translateZ(0);
  border-top: 1px solid transparent;
  border-right: 1px solid transparent;
  border-bottom: 1px solid transparent;
  border-left: 2px solid ${({ theme }) => theme.green1};
  background: transparent;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  position: relative;
  left: -3px;
  top: -3px;
`
