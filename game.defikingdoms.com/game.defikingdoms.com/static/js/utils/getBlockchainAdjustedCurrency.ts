import { Blockchain, Currency, ETHER, BINANCE_COIN, HARMONY, ChainId, JEWEL } from 'constants/sdk-extra'

export default function getBlockchainAdjustedCurrency(
  blockchain: Blockchain,
  currency: Currency | undefined,
  chainId: ChainId
): Currency | undefined {
  if (!currency) return currency
  if (currency !== ETHER) return currency
  if (chainId === ChainId.DFK_MAINNET || chainId === ChainId.DFK_TESTNET) return JEWEL
  switch (blockchain) {
    case Blockchain.BINANCE_SMART_CHAIN:
      return BINANCE_COIN
    case Blockchain.HARMONY:
      return HARMONY
    default:
      return ETHER
  }
}
