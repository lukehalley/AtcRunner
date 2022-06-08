import { Item } from '../../Item'
import { setSelectedLorePageIndex, setShowLorePageModal } from '../../state'
import { ItemKeys, ItemType } from '../../types'
import eternalStoryPageImage from './images/eternal-story-page-5.png'

export const eternalStoryPageFive = new Item({
  key: ItemKeys.ETERNAL_STORY_PAGE_FIVE,
  name: 'Eternal Story Page Five',
  description:
    'A decorative page weathered with time and torn from a book, detailing the creatures who inhabit the world of Gaia.',
  image: eternalStoryPageImage,
  type: ItemType.SUBCOLLECTION,
  addresses: {},
  customEvents: [
    {
      label: 'View Page',
      methods: [
        {
          func: setSelectedLorePageIndex,
          args: [4]
        },
        {
          func: setShowLorePageModal,
          args: [true]
        }
      ]
    }
  ]
})
