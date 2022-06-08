import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import fortitudeCrystalImage from '../images/fortitude-crystal-lesser.gif'
import { ItemKeys, ItemType } from '../types'

export const fortitudeCrystalLesser = new Item({
  key: ItemKeys.FORTITUDE_CRYSTAL_LESSER,
  name: 'Lesser Fortitude Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+5% to Primary Stat Growth roll for END</li><li>+15% to Secondary Stat Growth roll for END</li></ul>',
  image: fortitudeCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKLFRTICR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x3017609B9A59B77B708D783835B6fF94a3D9E337',
    [ChainId.HARMONY_TESTNET]: '0x5a57Ca33DEc5A63132235d9a0e3dac3cdc5c5003'
  }
})
