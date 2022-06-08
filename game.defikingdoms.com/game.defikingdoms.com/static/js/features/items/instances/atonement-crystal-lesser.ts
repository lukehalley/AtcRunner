import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import atonementCrystalImage from '../images/atonement-crystal-lesser.gif'
import { ItemKeys, ItemType } from '../types'

export const atonementCrystalLesser = new Item({
  key: ItemKeys.ATONEMENT_CRYSTAL_LESSER,
  name: 'Lesser Atonement Crystal',
  description: 'Applies bonus when leveling up a hero:<ul><li>+15 Bonus to HP</li></ul>',
  image: atonementCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKLATONECR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x1f3F655079b70190cb79cE5bc5AE5F19dAf2A6Cf',
    [ChainId.HARMONY_TESTNET]: '0x351D17791c396128163185a8512aC9edC820C03A'
  }
})
