import { Blockchain } from 'constants/sdk-extra'

export default function getExplorerName(blockchain: Blockchain): string {
  switch (blockchain) {
    case Blockchain.BINANCE_SMART_CHAIN:
      return 'BSCScan'
    case Blockchain.HARMONY:
      return 'Harmony Explorer'
    case Blockchain.DFK_CHAIN:
      return 'DFK Explorer'
    default:
      return 'Etherscan'
  }
}
