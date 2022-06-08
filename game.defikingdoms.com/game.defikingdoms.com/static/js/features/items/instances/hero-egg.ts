import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import heroEggImage from '../images/hero-egg.png'
import { ItemKeys, ItemType } from '../types'

export const heroEgg = new Item({
  key: ItemKeys.HERO_EGG,
  name: 'Hero Egg',
  description: 'You can feel power seeping from this egg.',
  image: heroEggImage,
  type: ItemType.SUMMON,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
