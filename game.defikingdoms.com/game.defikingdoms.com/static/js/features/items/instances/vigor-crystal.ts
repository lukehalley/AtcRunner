import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import vigorCrystalImage from '../images/vigor-crystal.gif'
import { ItemKeys, ItemType } from '../types'

export const vigorCrystal = new Item({
  key: ItemKeys.VIGOR_CRYSTAL,
  name: 'Vigor Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+10% to Primary Stat Growth roll for VIT</li><li>+30% to Secondary Stat Growth roll for VIT</li></ul>',
  image: vigorCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKVGRCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xBbA50bD111DC586Fd1f2B1476B6eC505800A3FD0',
    [ChainId.HARMONY_TESTNET]: '0xFe168C31fa552a3164e1CC9914bCb7A2f6F3ee25'
  }
})
