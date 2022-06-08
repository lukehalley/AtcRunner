import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import finesseCrystalImage from '../images/finesse-crystal-lesser.gif'
import { ItemKeys, ItemType } from '../types'

export const finesseCrystalLesser = new Item({
  key: ItemKeys.FINESSE_CRYSTAL_LESSER,
  name: 'Lesser Finesse Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+5% to Primary Stat Growth roll for DEX</li><li>+15% to Secondary Stat Growth roll for DEX</li></ul>',
  image: finesseCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKLFINCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x39927A2CEE5580d63A163bc402946C7600300373',
    [ChainId.HARMONY_TESTNET]: '0x25117B22Ee77fEE82813A864785704cfEd9e37C5'
  }
})
