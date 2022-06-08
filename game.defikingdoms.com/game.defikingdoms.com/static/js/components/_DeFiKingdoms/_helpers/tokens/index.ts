import { getChainId } from 'features/web3/utils'

declare let window: any

export const formatSymbol = (symbol: string) => {
  if (symbol === '') return symbol
  let formattedSymbol = symbol
  if (formattedSymbol.length > 11) formattedSymbol = formattedSymbol.replace(/[aeiou]/gi, '')
  if (formattedSymbol.length > 11) formattedSymbol = formattedSymbol.substring(0, 11)
  return formattedSymbol
}

export const addToken = async (item: any, token: any) => {
  const { ethereum } = window
  const chainId = getChainId()
  try {
    await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: item?.addresses[chainId],
          symbol: formatSymbol(token?.symbol || ''),
          decimals: token?.decimals,
          image: token?.logoURI
        }
      }
    })
  } catch (error) {
    alert('error: check console for details.')
    console.log(error)
  }
}
