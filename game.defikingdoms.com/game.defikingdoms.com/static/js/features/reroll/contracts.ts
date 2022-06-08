import { dispatch } from 'features'
import { updateHero } from 'features/heroes/state'
import { setGas } from 'utils'
import { getGen0RerollCore } from 'utils/contracts'
import { Hero } from 'utils/dfkTypes'
import errorHandler from 'utils/errorHandler'
import {
  addActiveRerollHero,
  removeActiveRerollHero,
  setActiveTabIndex,
  setIsProcessing,
  setRewards,
  removeSelectedHero,
  setShowGen0RerollModal,
  setShowRewardsModal
} from './state'
import { RerollChoices, RerollStatus } from './types'
import { getRerollRewardsFromReceipt } from './utils'

export async function getHeroRerollFinishTime(hero: Hero) {
  const gen0RerollCore = getGen0RerollCore()
  try {
    const heroDetails = await gen0RerollCore.heroToRerollData(hero.id)
    return new Date(Number(heroDetails.finishTime) * 1000)
  } catch (e) {
    errorHandler(e)
    return null
  }
}

export async function validateRerollStatus(hero: Hero) {
  const gen0RerollCore = getGen0RerollCore()
  try {
    const heroDetails = await gen0RerollCore.heroToRerollData(hero.id)
    return heroDetails.status === RerollStatus.NONE
  } catch (e) {
    errorHandler(e)
    return false
  }
}

export async function handleBeginGen0Reroll(
  selectedHero: Hero | null,
  rerollChoice: RerollChoices | null,
  addTransaction: Function
) {
  const gen0RerollCore = getGen0RerollCore()
  if (gen0RerollCore && selectedHero && rerollChoice !== null) {
    try {
      dispatch(setIsProcessing(true))
      const response = await gen0RerollCore.startRoll(selectedHero.id, rerollChoice, setGas())

      addTransaction(response, {
        summary: 'Start Gen0 Reroll'
      })

      await response.wait(1).then(() => {
        dispatch(setIsProcessing(false))
        dispatch(setActiveTabIndex(1))
        dispatch(addActiveRerollHero(selectedHero))
        dispatch(removeSelectedHero())
      })
    } catch (e) {
      errorHandler(e)
      dispatch(setIsProcessing(false))
    }
  }
}

export async function handleCompleteGen0Reroll(
  selectedHero: Hero,
  addTransaction: Function,
  setIsProcessing: Function
) {
  const gen0RerollCore = getGen0RerollCore()
  if (gen0RerollCore) {
    try {
      setIsProcessing(true)
      const response = await gen0RerollCore.endRoll(selectedHero.id, setGas())

      addTransaction(response, {
        summary: 'Complete Gen0 Reroll'
      })

      await response.wait(1).then((receipt: any) => {
        console.log('Complete Gen0 Reroll', { receipt })

        if (receipt.events) {
          const rewards = getRerollRewardsFromReceipt(receipt)
          if (rewards) {
            dispatch(setRewards(rewards))
            if (rewards.hero) {
              dispatch(updateHero(rewards.hero.after))
            }
          }
        }

        setIsProcessing(false)
        dispatch(setActiveTabIndex(0))
        dispatch(setShowGen0RerollModal(false))
        dispatch(setShowRewardsModal(true))
        dispatch(removeActiveRerollHero(selectedHero))
      })
    } catch (e) {
      setIsProcessing(false)
      errorHandler(e)
    }
  }
}
