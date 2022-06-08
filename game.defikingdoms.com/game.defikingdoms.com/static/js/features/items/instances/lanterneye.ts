import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import lanterneyeImage from '../images/lanterneye.png'
import { ItemKeys, ItemType } from '../types'

export const lanterneye = new Item({
  key: ItemKeys.LANTERNEYE,
  name: 'Lanterneye',
  description: 'Known to have a connection to magic. Don’t go toward the light...',
  image: lanterneyeImage,
  type: ItemType.INGREDIENT,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x8Bf4A0888451C6b5412bCaD3D9dA3DCf5c6CA7BE',
    [ChainId.HARMONY_TESTNET]: '0x555174F89aF046F3972607b1a39dE8949d26c4E0'
  },
  tokenSymbol: 'DFKLANTERNEYE',
  salesPrice: 5,
  featuredMetric: true
})
