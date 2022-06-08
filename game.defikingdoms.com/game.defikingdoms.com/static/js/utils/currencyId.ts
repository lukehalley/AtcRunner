import { DEFAULT_CURRENCIES } from 'constants/sdk-extra'
import { getChainId } from 'features/web3/utils'
import baseCurrencies from './baseCurrencies'

export function currencyId(currency: any): string {
  const chainId = getChainId()
  const baseCurrency = baseCurrencies(chainId)[0]
  if (currency && DEFAULT_CURRENCIES.includes(currency)) {
    return baseCurrency && baseCurrency.symbol ? baseCurrency.symbol : 'ETH'
  }
  if (currency && currency.address) return currency.address
  throw new Error('invalid currency')
}
