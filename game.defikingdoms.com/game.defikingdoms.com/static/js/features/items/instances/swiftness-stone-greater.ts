import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import swiftnessStoneImage from '../images/swiftness-stone-greater.gif'
import { ItemKeys, ItemType } from '../types'

export const swiftnessStoneGreater = new Item({
  key: ItemKeys.SWIFTNESS_STONE_GREATER,
  name: 'Greater Swiftness Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+8 AGI</li><li>+7% to Primary Stat Growth</li><li>+21% to Secondary Stat Growth</li></ul>',
  image: swiftnessStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKGSWFTST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xA1a56D20e4ba3fd2FB91c80f611ECa43c1311Afe',
    [ChainId.HARMONY_TESTNET]: '0x5686Aab9729ef000d25889c49db5EEeDF555988e'
  }
})
