import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import atonementCrystalImage from '../images/atonement-crystal-greater.gif'
import { ItemKeys, ItemType } from '../types'

export const atonementCrystalGreater = new Item({
  key: ItemKeys.ATONEMENT_CRYSTAL_GREATER,
  name: 'Greater Atonement Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+1 to two random, mutually exclusive, stats</li><li>+1% to Primary Stat Growth of those same stats</li><li>+2% to Secondary Stat Growth of those same stats</li></ul>',
  image: atonementCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKGATONECR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x17f3B5240C4A71a3BBF379710f6fA66B9b51f224',
    [ChainId.HARMONY_TESTNET]: '0xE02A5D2b8d08D9Da01164669A4838f7aC040DAEF'
  }
})
