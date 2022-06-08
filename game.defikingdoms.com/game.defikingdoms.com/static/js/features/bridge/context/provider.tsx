import { ChangeEvent, ReactNode, useEffect, useState } from 'react'
import { SingleValue } from 'react-select'
import { ChainId, Networks, Token, Tokens } from '@synapseprotocol/sdk'
import { BigNumber } from 'ethers'
import { useActiveWeb3React } from 'hooks'
import { BridgeContext } from '.'
import { changeNetwork, getTokenBalance } from '../api'
import { getDestinationChains, getDestinationChainTokens, selectDefaultNetwork } from '../utils'
import { sourceNetworks } from './defaults'

interface BridgeContextProviderProps {
  children: ReactNode
}

export function BridgeContextProvider({ children }: BridgeContextProviderProps) {
  const { library } = useActiveWeb3React()
  const { chainId, account } = useActiveWeb3React()
  const [selectedSourceNetwork, setSelectedSourceNetwork] = useState(sourceNetworks[0])
  const sourceTokens = selectedSourceNetwork.bridgeableTokens
  const [selectedSourceToken, setSelectedSourceToken] = useState(sourceTokens[0])
  const [destinationNetworks, setDestinationNetworks] = useState(
    getDestinationChains({
      sourceChain: selectedSourceNetwork.chainId,
      sourceToken: selectedSourceToken
    })
  )
  const destinationChain = destinationNetworks[0]
  const [selectedDestinationNetwork, setSelectedDestinationNetwork] = useState(destinationChain)
  const [destinationTokens, setDestinationTokens] = useState(
    getDestinationChainTokens({
      sourceChain: selectedSourceNetwork.chainId,
      sourceToken: selectedSourceToken,
      destChain: destinationChain.chainId
    })
  )

  const [selectedDestinationToken, setSelectedDestinationToken] = useState(destinationTokens[0])
  const [connectedNetwork, setConnectedNetwork] = useState<Networks.Network>()
  const [balance, setBalance] = useState(0)
  const [amountIn, setAmountIn] = useState('0')
  const [amountOut, setAmountOut] = useState(BigNumber.from(0))
  const [fee, setFee] = useState(BigNumber.from(0))

  useEffect(() => {
    if (chainId) {
      setConnectedNetwork(Networks.fromChainId(chainId))
    }
  }, [chainId])

  useEffect(() => {
    const network = sourceNetworks.find(
      n => n.chainId === (connectedNetwork !== null ? connectedNetwork?.chainId : ChainId.HARMONY)
    )
    if (network) {
      const sourceChain = network.chainId
      const sourceToken = network.tokens.find(t => t.symbol === Tokens.JEWEL.symbol) || network.tokens[0]
      const destNetworks = getDestinationChains({
        sourceChain,
        sourceToken
      })

      const destNetwork = selectDefaultNetwork(destNetworks, sourceToken, sourceChain)

      const destChain = destNetwork.chainId
      const destTokens = getDestinationChainTokens({
        sourceChain,
        sourceToken,
        destChain
      })
      setSelectedSourceNetwork(network)
      setSelectedSourceToken(sourceToken)
      setDestinationNetworks(destNetworks)
      setSelectedDestinationNetwork(destNetwork)
      setDestinationTokens(destTokens)
      setSelectedDestinationToken(destTokens[0])
    }
  }, [connectedNetwork])

  useEffect(() => {
    if (account && library && chainId) {
      getTokenBalance(selectedSourceToken, account, chainId, library).then(b => {
        if (b !== balance) {
          setBalance(b)
        }
      })
    }
  }, [account, library, chainId, selectedSourceNetwork, selectedSourceToken, amountIn, balance])

  async function handleSourceNetworkChange(newValue: SingleValue<Networks.Network>) {
    const newNetwork = sourceNetworks.find(n => n === newValue)
    if (window && newNetwork && chainId) {
      const isSuccessful = await changeNetwork(window.ethereum, chainId, newNetwork)
      if (isSuccessful && Number(newNetwork.chainId) === chainId) {
        setSelectedSourceNetwork(newNetwork)
      }
    }
  }

  function handleSourceTokenChange(newValue: SingleValue<Token>) {
    const newToken = sourceTokens.find(t => t === newValue)
    if (newToken) {
      setSelectedSourceToken(newToken)
      const destNetworks = getDestinationChains({
        sourceChain: selectedSourceNetwork.chainId,
        sourceToken: newToken
      })

      const destNetwork = selectDefaultNetwork(destNetworks, newToken, Number(chainId))
      const destTokens = getDestinationChainTokens({
        sourceChain: selectedSourceNetwork.chainId,
        sourceToken: newToken,
        destChain: destNetwork.chainId
      })

      setSelectedSourceToken(newToken)
      setDestinationNetworks(destNetworks)
      setSelectedDestinationNetwork(destNetwork)
      setDestinationTokens(destTokens)
      setSelectedDestinationToken(destTokens[0])
    }
  }

  function handleDestinationNetworkChange(newValue: SingleValue<Networks.Network>) {
    const newNetwork = destinationNetworks.find(n => n === newValue)
    if (newNetwork) {
      setSelectedDestinationNetwork(newNetwork)
      const newTokens = getDestinationChainTokens({
        sourceChain: selectedSourceNetwork.chainId,
        sourceToken: selectedSourceToken,
        destChain: newNetwork.chainId
      })
      setDestinationTokens(newTokens)
      setSelectedDestinationToken(newTokens[0])
    }
  }

  function handleDestinationTokenChange(newValue: SingleValue<Token>) {
    const newToken = destinationTokens.find(t => t === newValue)
    if (newToken) {
      setSelectedDestinationToken(newToken)
    }
  }

  function handleAmountChange(e: ChangeEvent<HTMLInputElement>) {
    const amountValue = e.target.value
    setAmountIn(amountValue)
  }

  return (
    <BridgeContext.Provider
      value={{
        sourceNetworks,
        selectedSourceNetwork,
        sourceTokens,
        selectedSourceToken,
        destinationNetworks,
        selectedDestinationNetwork,
        destinationTokens,
        selectedDestinationToken,
        balance,
        amountIn,
        amountOut,
        fee,
        handleSourceNetworkChange,
        handleSourceTokenChange,
        handleDestinationNetworkChange,
        handleDestinationTokenChange,
        handleAmountChange,
        setBalance,
        setAmountIn,
        setAmountOut,
        setFee
      }}
    >
      {children}
    </BridgeContext.Provider>
  )
}
