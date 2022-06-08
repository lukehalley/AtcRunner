import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import petEggGreyImage from '../images/pet-egg-grey.png'
import { ItemKeys, ItemType } from '../types'

export const petEggGrey = new Item({
  key: ItemKeys.PET_EGG_GREY,
  name: 'Grey Pet Egg',
  description: 'An egg that reminds you of the forest.',
  image: petEggGreyImage,
  type: ItemType.PET,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x95d02C1Dc58F05A015275eB49E107137D9Ee81Dc',
    [ChainId.HARMONY_TESTNET]: '0x2dd97351F41411B2fAf0FbEb4235737815c7857b'
  },
  tokenSymbol: 'DFKGREGG',
  featuredMetric: true
})
