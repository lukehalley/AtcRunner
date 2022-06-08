import { useEffect, useState } from 'react'

export const getRandomIndex = (total: number): number => {
  const randomSplit = 1 / total
  const randomNumber = Math.random()
  return Math.floor(randomNumber / randomSplit)
}

export const randomizeStrings = (textOptions: string[]) => {
  const numOptions = textOptions.length
  const randomSplit = 1 / numOptions
  const randomNumber = Math.random()
  const randomIndex = Math.floor(randomNumber / randomSplit)

  return textOptions[randomIndex]
}

export const useRandomDialogue = (dialogueOptions: string[], randomizeTrigger: boolean): string => {
  const [randomDialogue, setRandomDialogue] = useState(dialogueOptions[0])

  useEffect(() => {
    if (randomizeTrigger) {
      setRandomDialogue(randomizeStrings(dialogueOptions))
    }
  }, [randomizeTrigger])

  return randomDialogue
}
