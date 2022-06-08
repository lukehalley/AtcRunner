import { CurrencyAmount, JSBI, DEFAULT_CURRENCIES } from 'constants/sdk-extra'
import { MIN_ETH } from '../constants'

/**
 * Given some token amount, return the max that can be spent of it
 * @param currencyAmount to return max of
 */
export function maxAmountSpend(currencyAmount?: CurrencyAmount): CurrencyAmount | undefined {
  if (!currencyAmount) return undefined
  if (currencyAmount.currency && DEFAULT_CURRENCIES.includes(currencyAmount.currency)) {
    if (JSBI.greaterThan(currencyAmount.raw, MIN_ETH)) {
      return CurrencyAmount.ether(JSBI.subtract(currencyAmount.raw, MIN_ETH))
    } else {
      return CurrencyAmount.ether(JSBI.BigInt(0))
    }
  }
  return currencyAmount
}

/**
 * Given some token amount, return the half that can be spent of it
 * @param currencyAmount to return half of
 */
export function halfAmountSpend(currencyAmount?: CurrencyAmount): CurrencyAmount | undefined {
  if (!currencyAmount) return undefined
  if (currencyAmount.currency && DEFAULT_CURRENCIES.includes(currencyAmount.currency)) {
    if (JSBI.greaterThan(currencyAmount.raw, MIN_ETH)) {
      try {
        return CurrencyAmount.ether(JSBI.divide(currencyAmount.raw, JSBI.BigInt(2)))
      } catch (error) {
        return undefined
      }
    } else {
      return CurrencyAmount.ether(JSBI.BigInt(0))
    }
  }
  return CurrencyAmount.ether(JSBI.divide(currencyAmount.raw, JSBI.BigInt(2)))
}
