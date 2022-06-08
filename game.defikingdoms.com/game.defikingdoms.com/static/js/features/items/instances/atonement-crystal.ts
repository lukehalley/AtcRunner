import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import atonementCrystalImage from '../images/atonement-crystal.gif'
import { ItemKeys, ItemType } from '../types'

export const atonementCrystal = new Item({
  key: ItemKeys.ATONEMENT_CRYSTAL,
  name: 'Atonement Crystal',
  description: 'Applies bonus when leveling up a hero:<ul><li>+35 Bonus to HP</li><li>+10 Bonus to MP</li></ul>',
  image: atonementCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKATONECR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x27dC6AaaD95580EdF25F8B9676f1B984e09e413d',
    [ChainId.HARMONY_TESTNET]: '0x0F798BDA7777F59138Ef8E7Ad03DC98EFa3D207d'
  }
})
