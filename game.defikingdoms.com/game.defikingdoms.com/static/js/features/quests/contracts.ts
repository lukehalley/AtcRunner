import { TransactionResponse } from '@ethersproject/providers'
import { updatedStaminaCooldown } from 'components/_DeFiKingdoms/Heroes/utils/staminaCalculations'
import { QuestCore, QuestCoreOld } from 'constants/abis/types'
import { ZERO_ADDRESS } from 'constants/index'
import { ContractTransaction } from 'ethers'
import store, { dispatch } from 'features'
import { playSoundEffect } from 'features/audio/utils'
import { updateHero } from 'features/heroes/state'
import { StakingInfo } from 'features/stake/hooks'
import { getChainId } from 'features/web3/utils'
import { calculateGasMargin, setGas, setGasProperty } from 'utils'
import { getHeroCore, getQuestCore, getQuestCoreOld } from 'utils/contracts'
import { Hero } from 'utils/dfkTypes'
import errorHandler from 'utils/errorHandler'
import { Quest } from './Quest'
import {
  clearSelectedHeroes,
  removeActiveQuest,
  setQuestManagementTabIndex,
  setRewardQuestData,
  setShowQuestManagementModal,
  setShowQuestRewardModal
} from './state'
import { ActiveQuest, QuestEventTypes } from './types'
import {
  getQuestFromAddress,
  fetchActiveQuests,
  handleEndedQuest,
  isAttemptBased,
  fetchActiveQuestsOld,
  isQuestCore
} from './utils'

export const handleQuestBegin = async (
  selectedHeroes: Array<Hero>,
  questAttempts: number,
  addTransaction: Function,
  address: string,
  setTransactionProcessing: Function,
  questData: Quest
) => {
  const chainId = getChainId()
  let questCore: QuestCore | QuestCoreOld

  if (isAttemptBased(questData.type)) {
    questCore = getQuestCore()
  } else {
    questCore = getQuestCoreOld()
  }

  if (questCore && selectedHeroes) {
    try {
      setTransactionProcessing(true)

      const selectedHeroIds = selectedHeroes.map(s => s.id)
      let response: ContractTransaction
      if (isQuestCore(questCore, chainId)) {
        response = await questCore.startQuest(selectedHeroIds, address, questAttempts, questData.level, setGas())
      } else {
        response = await questCore.startQuest(selectedHeroIds, address, questAttempts, setGas())
      }

      addTransaction(response, {
        summary: `Start Quest`
      })

      await response.wait(1).then(receipt => {
        const startedEvent = receipt.events?.filter(e => e.event === QuestEventTypes.STARTED)[0]
        const modalOpen = store.getState().quests.showQuestManagementModal
        const storeQuest = store.getState().quests.questData
        const storeAddress = storeQuest.addresses[chainId]
        const questArgsPath = isAttemptBased(questData.type)
          ? startedEvent?.args?.quest.questAddress
          : startedEvent?.args?.quest.quest
        const startedQuest = getQuestFromAddress(questArgsPath)

        if (startedQuest?.audio) {
          playSoundEffect(startedQuest.audio)
        }

        const updatedHeroes = selectedHeroes.map(h => ({
          ...h,
          isQuesting: true
        }))
        updatedHeroes.forEach(h => {
          dispatch(updateHero(h))
        })

        if (modalOpen && storeAddress === questArgsPath) {
          dispatch(setQuestManagementTabIndex(1))
          dispatch(clearSelectedHeroes())
          setTransactionProcessing(false)
        }
      })
    } catch (e) {
      setTransactionProcessing(false)
      errorHandler(e)
    }
  }
}

export const handleGardeningQuestBegin = async (
  selectedHeroes: Array<Hero>,
  selectedGarden: StakingInfo | null,
  addTransaction: Function,
  address: string,
  setTransactionProcessing: Function
) => {
  const chainId = getChainId()
  const questCore = getQuestCoreOld()

  if (questCore && selectedHeroes && selectedGarden) {
    try {
      setTransactionProcessing(true)
      const selectedHeroIds = selectedHeroes.map(s => s.id)
      const questData = {
        uint1: selectedGarden.pid,
        uint2: 0,
        uint3: 0,
        uint4: 0,
        int1: 0,
        int2: 0,
        string1: '',
        string2: '',
        address1: ZERO_ADDRESS,
        address2: ZERO_ADDRESS,
        address3: ZERO_ADDRESS,
        address4: ZERO_ADDRESS
      }

      const response = await questCore.startQuestWithData(selectedHeroIds, address, 1, questData, setGas())

      addTransaction(response, {
        summary: `Start Quest`
      })

      await response.wait(1).then(receipt => {
        const startedEvent = receipt.events?.filter(e => e.event === QuestEventTypes.STARTED)[0]

        const modalOpen = store.getState().quests.showQuestManagementModal
        const storeQuest = store.getState().quests.questData
        const storeAddress = storeQuest.addresses[chainId]
        const startedQuest = getQuestFromAddress(startedEvent?.args?.quest.quest)

        if (startedQuest?.audio) {
          playSoundEffect(startedQuest.audio)
        }

        const updatedHeroes = selectedHeroes.map(h => ({
          ...h,
          isQuesting: true
        }))
        updatedHeroes.forEach(h => {
          dispatch(updateHero(h))
        })

        if (modalOpen && storeAddress === startedEvent?.args?.quest.quest) {
          dispatch(setQuestManagementTabIndex(1))
          dispatch(clearSelectedHeroes())
          setTransactionProcessing(false)
        }
      })
    } catch (e) {
      setTransactionProcessing(false)
      errorHandler(e)
    }
  }
}

export const handleQuestComplete = async (
  heroId: string | number,
  questData: Quest,
  rewardQuestData: ActiveQuest,
  addTransaction: Function,
  setTransactionProcessing: Function
) => {
  let questCore: QuestCore | QuestCoreOld
  if (isAttemptBased(questData.type)) {
    questCore = getQuestCore()
  } else {
    questCore = getQuestCoreOld()
  }

  if (questCore) {
    try {
      setTransactionProcessing(true)
      const response: TransactionResponse = await questCore.completeQuest(heroId, setGas())

      addTransaction(response, {
        summary: 'Complete Quest'
      })

      await response.wait(1).then(async receipt => {
        const modalOpen = store.getState().quests.showQuestManagementModal
        await handleEndedQuest(receipt)
        dispatch(setShowQuestRewardModal(true))
        dispatch(setShowQuestManagementModal(false))
        dispatch(setQuestManagementTabIndex(0))
        dispatch(setRewardQuestData(rewardQuestData))

        if (modalOpen) {
          setTransactionProcessing(false)
        }
      })
    } catch (e) {
      setTransactionProcessing(false)
      errorHandler(e)
    }
  }
}

export const handleCompleteHungQuest = async (
  hero: Hero,
  addTransaction: Function,
  setTransactionProcessing: Function,
  questDataPassed?: Quest
) => {
  let questCore: QuestCore | QuestCoreOld
  if (questDataPassed && isAttemptBased(questDataPassed.type)) {
    questCore = getQuestCore()
  } else {
    questCore = getQuestCoreOld()
  }

  if (questCore) {
    try {
      setTransactionProcessing(true)
      const response: TransactionResponse = await questCore.completeQuest(hero.id, setGas())

      addTransaction(response, {
        summary: 'Complete Quest'
      })

      await response.wait(1).then(receipt => {
        const updatedHero = {
          ...hero,
          isQuesting: false
        }

        dispatch(updateHero(updatedHero))
        setTransactionProcessing(false)
      })
    } catch (e) {
      setTransactionProcessing(false)
      errorHandler(e)
    }
  }
}

export const handleCompleteQuestEarly = async (
  heroId: string | number,
  questData: Quest,
  rewardQuestData: ActiveQuest,
  addTransaction: Function,
  setTransactionProcessing: Function
) => {
  const heroCore = getHeroCore()
  let questCore: QuestCore | QuestCoreOld
  if (isAttemptBased(questData.type)) {
    questCore = getQuestCore()
  } else {
    questCore = getQuestCoreOld()
  }

  if (questCore && heroCore) {
    try {
      setTransactionProcessing(true)
      const estimatedGas = await questCore.estimateGas.cancelQuest(heroId)
      const response: TransactionResponse = await questCore.cancelQuest(heroId, {
        gasLimit: calculateGasMargin(estimatedGas),
        gasPrice: setGasProperty()
      })

      addTransaction(response, {
        summary: 'Complete Quest Early'
      })

      const hero = store.getState().heroes.userHeroes.find((hero: Hero) => Number(hero.id) === Number(heroId))
      if (hero) {
        dispatch(
          updateHero({
            ...hero,
            isQuesting: false
          })
        )
      }

      await response.wait(1).then(async receipt => {
        const modalOpen = store.getState().quests.showQuestManagementModal
        await handleEndedQuest(receipt)
        dispatch(setShowQuestRewardModal(true))
        dispatch(setShowQuestManagementModal(false))
        dispatch(setQuestManagementTabIndex(0))
        dispatch(setRewardQuestData(rewardQuestData))
        if (isAttemptBased(questData.type)) {
          fetchActiveQuests()
        } else {
          fetchActiveQuestsOld()
        }

        if (modalOpen) {
          setTransactionProcessing(false)
        }
      })
    } catch (e) {
      setTransactionProcessing(false)
      errorHandler(e)
    }
  }
}

export const handleCancelQuest = async (
  hero: Hero,
  addTransaction: Function,
  setTransactionProcessing: Function,
  questDataPassed?: Quest
) => {
  let questCore: QuestCore | QuestCoreOld
  if (questDataPassed && isAttemptBased(questDataPassed.type)) {
    questCore = getQuestCore()
  } else {
    questCore = getQuestCoreOld()
  }

  setTransactionProcessing(true)
  try {
    const response = await questCore.cancelQuest(hero.id, setGas())
    addTransaction(response, {
      summary: `Cancel Quest`
    })

    await response.wait(1).then(receipt => {
      const chainId = getChainId()
      const modalOpen = store.getState().quests.showQuestManagementModal
      const storeQuest = store.getState().quests.questData
      const storeAddress = storeQuest.addresses[chainId]
      const canceledEvents = receipt.events?.filter(e => e.event === QuestEventTypes.CANCELED)

      canceledEvents?.forEach(cancelEvent => {
        const questArgsPath =
          questDataPassed && isAttemptBased(questDataPassed.type)
            ? cancelEvent.args?.quest.questAddress
            : cancelEvent.args?.quest.quest
        const questData = getQuestFromAddress(questArgsPath)
        const heroId = Number(cancelEvent.args?.heroId)
        const heroFiltered = store.getState().heroes.userHeroes.filter((hero: Hero) => {
          return Number(hero.id) === Number(heroId)
        })[0]

        if (questData) {
          const heroStaminaCost =
            heroFiltered.statGenes.profession === questData.proficiencyType
              ? questData.proficientStaminaCost
              : questData.baseStaminaCost
          const newStaminaCooldown = updatedStaminaCooldown(
            heroFiltered,
            cancelEvent.args?.quest.attempts * heroStaminaCost
          )

          const newData = { ...heroFiltered, staminaFullAt: newStaminaCooldown, isQuesting: false }
          dispatch(updateHero(newData))
        }

        dispatch(removeActiveQuest(Number(cancelEvent.args?.questId)))
      })

      if (
        modalOpen &&
        canceledEvents &&
        (storeAddress === canceledEvents[0].args?.quest.quest ||
          storeAddress === canceledEvents[0].args?.quest.questAddress)
      ) {
        dispatch(setQuestManagementTabIndex(0))
        dispatch(clearSelectedHeroes())
      }
      setTransactionProcessing(false)
    })
  } catch (error: any) {
    const stuckQuestMessage = 'execution reverted: no quest'
    errorHandler(error, undefined, stuckQuestMessage, async () => {
      try {
        const response: TransactionResponse = await questCore?.completeQuest(hero.id, setGas())
        addTransaction(response, {
          summary: `Cancel Quest`
        })

        await response.wait(1).then(receipt => {
          const newData = { ...hero, isQuesting: false }
          dispatch(updateHero(newData))
        })
      } catch (error) {
        errorHandler(error)
      }
      setTransactionProcessing(false)
    })

    if (error.data?.message !== stuckQuestMessage) {
      setTransactionProcessing(false)
    }
  }
}
