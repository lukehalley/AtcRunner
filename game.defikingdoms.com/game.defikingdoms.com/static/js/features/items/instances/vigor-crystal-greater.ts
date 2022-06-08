import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import vigorCrystalImage from '../images/vigor-crystal-greater.gif'
import { ItemKeys, ItemType } from '../types'

export const vigorCrystalGreater = new Item({
  key: ItemKeys.VIGOR_CRYSTAL_GREATER,
  name: 'Greater Vigor Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+15% to Primary Stat Growth roll for VIT</li><li>+45% to Secondary Stat Growth roll for VIT</li></ul>',
  image: vigorCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKGVGRCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x5292dbce7eC2e10dd500984A163A5aE8abA585Ce',
    [ChainId.HARMONY_TESTNET]: '0x6881d8c1628C15d7BfcBe52098db175AF4eA936e'
  }
})
