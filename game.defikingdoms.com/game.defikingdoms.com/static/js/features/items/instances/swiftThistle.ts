import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import swiftThistleImage from '../images/swift-thistle.png'
import { ItemKeys, ItemType } from '../types'

export const swiftThistle = new Item({
  key: ItemKeys.SWIFT_THISTLE,
  name: 'Swift-Thistle',
  description: 'The purple flowers are known to enhance speed when used correctly, hence the name.',
  image: swiftThistleImage,
  type: ItemType.INGREDIENT,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xCdfFe898E687E941b124dfB7d24983266492eF1d',
    [ChainId.HARMONY_TESTNET]: '0x3dc5DbE4eB979762Bbed0C559D0bfB4778582357'
  },
  tokenSymbol: 'DFKSWFTHSL',
  salesPrice: 75,
  featuredMetric: true
})
