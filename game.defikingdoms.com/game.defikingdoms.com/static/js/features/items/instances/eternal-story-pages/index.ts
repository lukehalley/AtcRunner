import ETERNAL_STORY_ABI from 'constants/abis/items/EternalStory.json'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../../Item'
import eternalStoryPageImage from '../../images/eternal-story-page.png'
import { ItemKeys, ItemType } from '../../types'

export const eternalStoryPages = new Item({
  key: ItemKeys.ETERNAL_STORY_PAGES,
  name: 'Pages of the Eternal Story',
  description: 'A weathered page with strange and wondrous legends, written with exquisite penmanship.',
  image: eternalStoryPageImage,
  type: ItemType.COLLECTION,
  tokenSymbol: 'DFKLFINCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x909EF175d58d0e17d3Ceb005EeCF24C1E5C6F390',
    [ChainId.HARMONY_TESTNET]: '0x241fEEb8B29e2A46C08b1C3ceefc632085baFc6B'
  },
  abi: ETERNAL_STORY_ABI,
  collectionItems: [
    ItemKeys.ETERNAL_STORY_PAGE_ONE,
    ItemKeys.ETERNAL_STORY_PAGE_TWO,
    ItemKeys.ETERNAL_STORY_PAGE_THREE,
    ItemKeys.ETERNAL_STORY_PAGE_FOUR,
    ItemKeys.ETERNAL_STORY_PAGE_FIVE,
    ItemKeys.ETERNAL_STORY_PAGE_SIX,
    ItemKeys.ETERNAL_STORY_PAGE_SEVEN,
    ItemKeys.ETERNAL_STORY_PAGE_EIGHT,
    ItemKeys.ETERNAL_STORY_PAGE_NINE,
    ItemKeys.ETERNAL_STORY_PAGE_TEN
  ]
})
