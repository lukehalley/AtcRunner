import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import sailfishImage from '../images/sailfish.png'
import { ItemKeys, ItemType } from '../types'

export const sailfish = new Item({
  key: ItemKeys.SAILFISH,
  name: 'Sailfish',
  description: 'Its dorsal fin resembles a sail, and it’s an incredibly fast swimmer.',
  image: sailfishImage,
  type: ItemType.INGREDIENT,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xb80A07e13240C31ec6dc0B5D72Af79d461dA3A70',
    [ChainId.HARMONY_TESTNET]: '0x9b794f8a2E89Ad6954ACe9454E832d467121F48a'
  },
  tokenSymbol: 'DFKSAILFISH',
  salesPrice: 50,
  featuredMetric: true
})
