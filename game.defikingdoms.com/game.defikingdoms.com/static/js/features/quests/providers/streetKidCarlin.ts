import { QuestProvider } from '../QuestProvider'
import { QuestKeys } from '../types'

export const streetKidCarlin = new QuestProvider({
  name: 'Street Kid Carlin',
  nameTag: 'Street Kid',
  description:
    "I like to practice my skills when the market isn't too busy. I'll show those other kids in their fancy clothing what I'm all about!",
  title: 'Game of Ball',
  npcImage: undefined,
  quests: [QuestKeys.BALL],
  itemDialogueMap: {}
})
