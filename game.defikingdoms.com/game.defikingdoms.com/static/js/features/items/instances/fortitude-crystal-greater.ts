import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import fortitudeCrystalImage from '../images/fortitude-crystal-greater.gif'
import { ItemKeys, ItemType } from '../types'

export const fortitudeCrystalGreater = new Item({
  key: ItemKeys.FORTITUDE_CRYSTAL_GREATER,
  name: 'Greater Fortitude Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+15% to Primary Stat Growth roll for END</li><li>+45% to Secondary Stat Growth roll for END</li></ul>',
  image: fortitudeCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKGFRTICR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xFE41BFf925eD88f688332b12746ef1Da68FD4CF2',
    [ChainId.HARMONY_TESTNET]: '0x148EDF7473fB413e9c37896Fc6De1b5dA24f946F'
  }
})
