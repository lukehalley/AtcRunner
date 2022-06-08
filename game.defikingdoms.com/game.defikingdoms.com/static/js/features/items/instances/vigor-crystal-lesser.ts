import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import vigorCrystalImage from '../images/vigor-crystal-lesser.gif'
import { ItemKeys, ItemType } from '../types'

export const vigorCrystalLesser = new Item({
  key: ItemKeys.VIGOR_CRYSTAL_LESSER,
  name: 'Lesser Vigor Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+5% to Primary Stat Growth roll for VIT</li><li>+15% to Secondary Stat Growth roll for VIT</li></ul>',
  image: vigorCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKLVGRCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x0d8403E47445DB9E316E36F476dacD5827220Bdd',
    [ChainId.HARMONY_TESTNET]: '0xc4BEBAE1e32E49f5851fA20797EB5892d8FA52A0'
  }
})
