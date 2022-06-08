import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import ragweedImage from '../images/ragweed.png'
import { ItemKeys, ItemType } from '../types'

export const ragweed = new Item({
  key: ItemKeys.RAGWEED,
  name: 'Ragweed',
  description: 'A lousy allergen and irritant. Highly invasive. Sells for a bounty.',
  image: ragweedImage,
  type: ItemType.SCRAP,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x043F9bd9Bb17dFc90dE3D416422695Dd8fa44486',
    [ChainId.HARMONY_TESTNET]: '0xa81D367C63F3e737688337fcbF4236Ce91f05347'
  },
  tokenSymbol: 'DFKRGWD',
  salesPrice: 2.5,
  featuredMetric: true
})
