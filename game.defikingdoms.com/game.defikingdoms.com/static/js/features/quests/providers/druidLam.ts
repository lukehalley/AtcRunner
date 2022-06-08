import { ItemKeys } from 'features/items/types'
import gardeningNPC from 'assets/images/professions/profile-lam.png'
import { QuestProvider } from '../QuestProvider'
import { QuestKeys } from '../types'

export const druidLam = new QuestProvider({
  name: 'Druid Lam',
  description:
    "You have gained trust among some of the druids, I have heard. I will show you to some of our special gardens. Let's go see what's in season and ripe for the picking.",
  title: 'Gardening Quests',
  npcImage: gardeningNPC,
  quests: [QuestKeys.GARDENING_0],
  itemDialogueMap: {
    [ItemKeys.BLUESTEM]: 'Ah, there was a Bluestem ready…the magical energy in these plants astonishes me.',
    [ItemKeys.JEWEL_BAG]:
      "It's amazing what you discover when you let the hand of Gaia lead you. Now take what you have found and use it for good.",
    [ItemKeys.MILKWEED]: 'This Milkweed is a perfect specimen. Look how white it is!',
    [ItemKeys.SPIDER_FRUIT]:
      "Gaia's ways are mysterious. Spiderfruit looks like poison, but actually helps save you from it."
  }
})
