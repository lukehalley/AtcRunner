import { Item } from '../../Item'
import { setSelectedLorePageIndex, setShowLorePageModal } from '../../state'
import { ItemKeys, ItemType } from '../../types'
import eternalStoryPageImage from './images/eternal-story-page-7.png'

export const eternalStoryPageSeven = new Item({
  key: ItemKeys.ETERNAL_STORY_PAGE_SEVEN,
  name: 'Eternal Story Page Seven',
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
          args: [6]
        },
        {
          func: setShowLorePageModal,
          args: [true]
        }
      ]
    }
  ]
})
