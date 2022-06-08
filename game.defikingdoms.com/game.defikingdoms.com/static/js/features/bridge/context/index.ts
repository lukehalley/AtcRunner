import { ChangeEventHandler, createContext } from 'react'
import { SingleValue } from 'react-select'
import { Networks, Token } from '@synapseprotocol/sdk'
import { BigNumber } from 'ethers'
import {
  sourceNetworks,
  selectedSourceNetwork,
  sourceTokens,
  selectedSourceToken,
  destinationNetworks,
  selectedDestinationNetwork,
  destinationTokens,
  selectedDestinationToken
} from './defaults'

interface BridgeContextValues {
  sourceNetworks: Networks.Network[]
  selectedSourceNetwork: Networks.Network
  sourceTokens: Token[]
  selectedSourceToken: Token
  destinationNetworks: Networks.Network[]
  selectedDestinationNetwork: Networks.Network
  destinationTokens: Token[]
  selectedDestinationToken: Token
  balance: number
  amountIn: string
  amountOut: BigNumber
  fee: BigNumber
  handleSourceNetworkChange: (newValue: SingleValue<Networks.Network>) => void
  handleSourceTokenChange: (newValue: SingleValue<Token>) => void
  handleDestinationNetworkChange: (newValue: SingleValue<Networks.Network>) => void
  handleDestinationTokenChange: (newValue: SingleValue<Token>) => void
  handleAmountChange: ChangeEventHandler
  setBalance: Function
  setAmountIn: Function
  setAmountOut: Function
  setFee: Function
}

export const BridgeContext = createContext<BridgeContextValues>({
  sourceNetworks,
  selectedSourceNetwork,
  sourceTokens,
  selectedSourceToken,
  destinationNetworks,
  selectedDestinationNetwork,
  destinationTokens,
  selectedDestinationToken,
  balance: 0,
  amountIn: '0',
  amountOut: BigNumber.from(0),
  fee: BigNumber.from(0),
  handleSourceNetworkChange: () => null,
  handleSourceTokenChange: () => null,
  handleDestinationNetworkChange: () => null,
  handleDestinationTokenChange: () => null,
  handleAmountChange: () => null,
  setBalance: () => null,
  setAmountIn: () => null,
  setAmountOut: () => null,
  setFee: () => null
})
