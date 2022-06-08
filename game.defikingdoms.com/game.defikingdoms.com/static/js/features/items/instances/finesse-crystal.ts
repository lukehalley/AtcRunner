import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import finesseCrystalImage from '../images/finesse-crystal.gif'
import { ItemKeys, ItemType } from '../types'

export const finesseCrystal = new Item({
  key: ItemKeys.FINESSE_CRYSTAL,
  name: 'Finesse Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+10% to Primary Stat Growth roll for DEX</li><li>+30% to Secondary Stat Growth roll for DEX</li></ul>',
  image: finesseCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKFINCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xc6A58eFc320A7aFDB1cD662eaf6de10Ee17103F2',
    [ChainId.HARMONY_TESTNET]: '0x720412b43E6eA9f061Cd6D89B491F29D415ab4ff'
  }
})
