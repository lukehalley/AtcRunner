import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import fortuneStoneImage from '../images/fortune-stone-greater.gif'
import { ItemKeys, ItemType } from '../types'

export const fortuneStoneGreater = new Item({
  key: ItemKeys.FORTUNE_STONE_GREATER,
  name: 'Greater Fortune Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+8 LCK</li><li>+7% to Primary Stat Growth</li><li>+21% to Secondary Stat Growth</li></ul>',
  image: fortuneStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKGFRTUST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x7f26CB2BBBcFCE8e5866cc02a887A591E1Adc02A',
    [ChainId.HARMONY_TESTNET]: '0x4FaaCc95D81E861016051dA3dcCC525C89098B0c'
  }
})
