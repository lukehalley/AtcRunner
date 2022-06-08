import { QuestProvider } from '../QuestProvider'
import { QuestKeys } from '../types'

export const luckyMoe = new QuestProvider({
  name: 'Lucky Moe',
  nameTag: 'Gambler',
  description:
    '"Step right up! Prizes await those who can best me at a game of cards!" <em>Moe\'s voice lowers.</em> "Be warned...I don\'t go easy. Hahaha!"',
  title: 'Card Game',
  npcImage: undefined,
  quests: [QuestKeys.CARDS],
  itemDialogueMap: {}
})
