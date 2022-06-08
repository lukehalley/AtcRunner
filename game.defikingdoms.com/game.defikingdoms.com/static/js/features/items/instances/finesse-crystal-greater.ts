import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import finesseCrystalImage from '../images/finesse-crystal-greater.gif'
import { ItemKeys, ItemType } from '../types'

export const finesseCrystalGreater = new Item({
  key: ItemKeys.FINESSE_CRYSTAL_GREATER,
  name: 'Greater Finesse Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+15% to Primary Stat Growth roll for DEX</li><li>+45% to Secondary Stat Growth roll for DEX</li></ul>',
  image: finesseCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKGFINCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xd1f789f6f8a3ee3fb94adBE3e82f43AAb51759Ee',
    [ChainId.HARMONY_TESTNET]: '0x83228013148950efB09f042fc096E4177Abb080a'
  }
})
