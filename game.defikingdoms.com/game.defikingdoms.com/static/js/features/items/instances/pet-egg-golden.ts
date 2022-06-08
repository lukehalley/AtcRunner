import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import petEggGoldenImage from '../images/pet-egg-golden.gif'
import { ItemKeys, ItemType } from '../types'

export const petEggGolden = new Item({
  key: ItemKeys.PET_EGG_GOLDEN,
  name: 'Golden Pet Egg',
  description: 'Looks like real gold. Is it though?',
  image: petEggGoldenImage,
  type: ItemType.PET,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x9edb3Da18be4B03857f3d39F83e5C6AAD67bc148',
    [ChainId.HARMONY_TESTNET]: '0x7b81c426162977525084dEe06Cb9D73F8A9fD77e'
  },
  tokenSymbol: 'DFKGOLDEGG',
  marketPrice: 50000
})
