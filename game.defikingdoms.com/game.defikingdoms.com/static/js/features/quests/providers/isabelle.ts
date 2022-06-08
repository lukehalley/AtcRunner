import { QuestProvider } from '../QuestProvider'
import { QuestKeys } from '../types'

export const isabelle = new QuestProvider({
  name: 'Isabelle',
  nameTag: 'Dancer',
  description:
    "Dancing has been in my heart since I was a little girl—not a day goes by where I don't get a step or two in, rain or shine! It's the little things in life worth experiencing.",
  title: 'Dancing',
  npcImage: undefined,
  quests: [QuestKeys.DANCING],
  itemDialogueMap: {}
})
