import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { calculateRemainingStamina } from 'components/_DeFiKingdoms/Heroes/utils/staminaCalculations'
import { QuestCore } from 'constants/abis/types/quests/QuestCore'
import { QuestCoreOld } from 'constants/abis/types/quests/QuestCoreOld'
import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId, TokenAmount } from 'constants/sdk-extra'
import { Contract, ContractReceipt, utils } from 'ethers'
import { LogDescription } from 'ethers/lib/utils'
import store, { dispatch } from 'features'
import { updateHero } from 'features/heroes/state'
import { buildContractHero } from 'features/heroes/utils'
import { itemMap } from 'features/items/constants'
import { ItemKeys, ItemType } from 'features/items/types'
import { getItemFromAddress } from 'features/items/utils'
import {
  clearSelectedHeroes,
  setActiveQuests,
  setQuestProviderData,
  setShowQuestProviderModal
} from 'features/quests/state'
import { ActiveQuest, GetPerformanceDialogueMap, QuestEventTypes, QuestType } from 'features/quests/types'
import { getChainId } from 'features/web3/utils'
import { getAccount } from 'features/web3/utils'
import { DateTime } from 'luxon'
import { getHeroCore, getQuestCore, getQuestCoreOld } from 'utils/contracts'
import { Hero } from 'utils/dfkTypes'
import { getRandomIndex } from 'utils/dialogue'
import { getAddressFromKey } from 'utils/getAddressFromKey'
import { getObjectFromAddress } from 'utils/getObjectFromAddress'
import { Quest } from './Quest'
import { QuestProvider } from './QuestProvider'
import { QUESTCORE_ADDRESSES, questMap, questProviderMap } from './constants'
import { setHeroRewardsMap, setQuestFailed, setQuestRewardAddress } from './state'
import {
  HeroRewardsMap,
  Professions,
  QuestKeys,
  QuestMap,
  QuestProviderKeys,
  Reward,
  RewardsDialogueMap
} from './types'

export function isQuestCore(core: QuestCore | QuestCoreOld, chainId: ChainId): core is QuestCore {
  return (core as QuestCore).address === QUESTCORE_ADDRESSES[chainId]
}

export const getProviderFromQuestAddress = (questAddress: string) => {
  const quest = getQuestFromAddress(questAddress)
  return quest?.provider
}

export const isAttemptBased = (type: QuestType) => {
  return type === QuestType.AttemptBased || type === QuestType.AttemptBasedTraining
}

export const handleQuestProviderSelect = (questProviderData: QuestProvider) => {
  dispatch(clearSelectedHeroes())
  dispatch(setShowQuestProviderModal(true))
  dispatch(setQuestProviderData(questProviderData))
}

export const calculateQuestCompleteTime = (numberOfHeroes: number, questAttempts: number, type: QuestType) => {
  const baseTime = 20
  const increasePerHero = type === QuestType.AttemptBased ? 10 : 0
  const increasePerAttempt = type === QuestType.AttemptBased ? 10 : 0
  const totalSeconds =
    numberOfHeroes * questAttempts * baseTime +
    increasePerHero * (questAttempts - 1) * numberOfHeroes +
    increasePerAttempt * (numberOfHeroes - 1) * questAttempts

  return totalSeconds <= 3600
    ? new Date(totalSeconds * 1000).toISOString().substr(14, 5)
    : new Date(totalSeconds * 1000).toISOString().substr(11, 8)
}

export const getAlternateContractEvents = (tx: ContractReceipt, contract: Contract) => {
  const events = [] as LogDescription[]
  const contractEvents = tx.events?.filter(e => e.address == contract.address)

  if (contractEvents) {
    for (const log of contractEvents) {
      events.push(contract.interface.parseLog(log))
    }
  }

  return events.map(e => ({ name: e.name, args: e.args }))
}

export const getQuestDurations = () => {
  const chainId = getChainId()

  return {
    gardenBaseSeconds: 720,
    gardenProficientSeconds: chainId === ChainId.HARMONY_TESTNET ? 10 : 600,
    miningBaseSeconds: 720,
    miningProficientSeconds: chainId === ChainId.HARMONY_TESTNET ? 10 : 600
  }
}

export const getStaminaCooldown = () => {
  const chainId = getChainId()
  return chainId === ChainId.HARMONY_TESTNET ? 20 : 1200
}

export const getLowestStaminaHero = (selectedHeroes: Hero[], returnStamina?: boolean) => {
  if (selectedHeroes.length <= 0) return 0
  const leastStaminaHero = selectedHeroes.reduce((prev, curr) => {
    const prevRemaining = calculateRemainingStamina(prev)
    const currRemaining = calculateRemainingStamina(curr)

    return prevRemaining < currRemaining ? prev : curr
  })

  return returnStamina ? calculateRemainingStamina(leastStaminaHero) : leastStaminaHero
}

export const calculateMaxJEWELUnlockRate = (hero: Hero, govTokenLockedBalance: TokenAmount) => {
  const minLocked = 20000
  const base = 0.25
  const sRate = 0.000625
  const mRate = 0.0025
  const heroProfession = hero.statGenes.profession
  const hasMatchingProficiencyType = heroProfession === Professions.MINING
  const geneBonus = hasMatchingProficiencyType ? 1 : 0
  const minLockedRatio = hasMatchingProficiencyType ? 833.33 : 1000
  const STR = hero.stats?.strength || 0
  const END = hero.stats?.endurance || 0
  const minSkl = hero.skills?.mining ? Math.floor(hero.skills.mining) : 0
  const lockedJEWEL = Number(govTokenLockedBalance.toExact())
  const lockedRatio =
    lockedJEWEL > minLocked ? 1000 - 166 * geneBonus : ((1000 - 166 * geneBonus) * minLocked) / lockedJEWEL
  const cappedLockedRatio = lockedRatio < minLockedRatio ? minLockedRatio : lockedRatio
  const unlockRate = (1000 * (base + (STR + END) * sRate + minSkl * mRate)) / cappedLockedRatio

  return unlockRate
}

export const calculateTotalJEWELUnlockRate = (
  heroes: Hero[],
  maxUnlockRate: number,
  govTokenLockedBalance: TokenAmount
) => {
  const base = 0.25
  const sRate = 0.000625
  const mRate = 0.0025

  const totalJEWELUnlockRate = heroes.reduce((totalUnlocked, hero) => {
    const heroProfession = hero.statGenes.profession
    const hasMatchingProficiencyType = heroProfession === Professions.MINING
    const geneBonus = hasMatchingProficiencyType ? 1 : 0
    const STR = hero.stats?.strength || 0
    const END = hero.stats?.endurance || 0
    const minSkl = hero.skills?.mining ? Math.floor(hero.skills.mining) : 0

    const heroUnlockRate = (1000 * (base + (STR + END) * sRate + minSkl * mRate)) / (6 * (1000 - 166 * geneBonus))
    return totalUnlocked + heroUnlockRate
  }, 0)

  return totalJEWELUnlockRate > maxUnlockRate ? maxUnlockRate : totalJEWELUnlockRate
}

export function getQuestAddressFromKey(questKey: QuestKeys) {
  return getAddressFromKey(questMap, questKey)
}

export function getQuestFromAddress(address: string) {
  return getObjectFromAddress<QuestMap, Quest>(address, questMap)
}

export const fetchActiveQuestsOld = async () => {
  const account = getAccount()
  const questCore = getQuestCoreOld()
  const heroCore = getHeroCore()
  const { profile } = store.getState().profile

  if (questCore && account) {
    try {
      const rawActiveQuests = await questCore.getActiveQuests(account)
      const activeQuests: Array<ActiveQuest> = []

      for (let i = 0; i < rawActiveQuests.length; i++) {
        const rawQuest = rawActiveQuests[i]
        let activeData

        try {
          activeData = await questCore.getQuestData(rawQuest.id)
        } catch (error) {}

        const { id, quest, heroes, attempts, completeAtTime, startTime } = rawQuest
        const mappedHeroes = heroes.map((hero: BigNumber) => Number(hero))
        const bigCompletedAt = BigNumber.from(completeAtTime)
        const completeAtTimeFinal = DateTime.fromSeconds(bigCompletedAt.toNumber())
        const bigStartTime = BigNumber.from(startTime)
        const startTimeFinal = DateTime.fromSeconds(bigStartTime.toNumber())
        const { userHeroes } = store.getState().heroes

        const generatedHeroes = []

        for (let i = 0; i < mappedHeroes.length; i++) {
          const heroId = mappedHeroes[i]
          const localHero = userHeroes.filter((hero: Hero) => hero.id === heroId)[0]

          if (typeof localHero !== 'undefined') {
            generatedHeroes.push(localHero)
          } else {
            try {
              const coreHero = await heroCore?.getHero(heroId)
              const builtHero = buildContractHero(coreHero, profile)

              if (builtHero) {
                generatedHeroes.push(builtHero)
              }
            } catch (error) {
              console.log(error)
            }
          }
        }

        activeQuests.push({
          id: Number(id),
          questAddress: quest.toLowerCase(),
          heroes: generatedHeroes,
          attempts,
          completeAtTime: completeAtTimeFinal,
          startTime: startTimeFinal,
          activeData
        })
      }

      dispatch(setActiveQuests(activeQuests))
    } catch (error) {
      throw error
    }
  }
}

export const fetchActiveQuests = async () => {
  const account = getAccount()
  const questCore = getQuestCore()
  const heroCore = getHeroCore()
  const { profile } = store.getState().profile

  if (questCore && account) {
    try {
      const rawActiveQuests = await questCore.getAccountActiveQuests(account)
      const activeQuests: Array<ActiveQuest> = []

      for (let i = 0; i < rawActiveQuests.length; i++) {
        const rawQuest = rawActiveQuests[i]
        let activeData

        try {
          activeData = await questCore.questData(rawQuest.id)
        } catch (error) {}

        const { id, questAddress, heroes, attempts, completeAtTime, startAtTime } = rawQuest
        const mappedHeroes = heroes.map((hero: BigNumber) => Number(hero))
        const bigCompletedAt = BigNumber.from(completeAtTime)
        const completeAtTimeFinal = DateTime.fromSeconds(bigCompletedAt.toNumber())
        const bigStartTime = BigNumber.from(startAtTime)
        const startTimeFinal = DateTime.fromSeconds(bigStartTime.toNumber())
        const { userHeroes } = store.getState().heroes

        const generatedHeroes = []

        for (let i = 0; i < mappedHeroes.length; i++) {
          const heroId = mappedHeroes[i]
          const localHero = userHeroes.filter((hero: Hero) => hero.id === heroId)[0]

          if (typeof localHero !== 'undefined') {
            generatedHeroes.push(localHero)
          } else {
            try {
              const coreHero = await heroCore?.getHero(heroId)
              const builtHero = buildContractHero(coreHero, profile)

              if (builtHero) {
                generatedHeroes.push(builtHero)
              }
            } catch (error) {
              console.log(error)
            }
          }
        }

        activeQuests.push({
          id: Number(id),
          questAddress: questAddress.toLowerCase(),
          heroes: generatedHeroes,
          attempts,
          completeAtTime: completeAtTimeFinal,
          startTime: startTimeFinal,
          activeData
        })
      }
      dispatch(setActiveQuests(activeQuests))
    } catch (error) {
      throw error
    }
  }
}

export const mapProfessionIndex = (professionIndex: number) => {
  switch (professionIndex) {
    case 0:
      return 'mining'
    case 2:
      return 'gardening'
    case 4:
      return 'fishing'
    case 6:
      return 'foraging'
    default:
      return ''
  }
}

interface TransactionReceiptWithEvents extends TransactionReceipt {
  events: any
}

function getRewardsFromReceipt(receipt: TransactionReceipt): { heroRewardsMap: HeroRewardsMap; questAddress: string } {
  const rewardsOld = (receipt as TransactionReceiptWithEvents).events.filter(
    (e: any) => e.event === QuestEventTypes.REWARD
  )
  const rewards = (receipt as TransactionReceiptWithEvents).events.filter(
    (e: any) => e.event === QuestEventTypes.REWARD_MINTED
  )
  const xpEvents = (receipt as TransactionReceiptWithEvents).events.filter((e: any) => e.event === QuestEventTypes.XP)
  const skillUps = (receipt as TransactionReceiptWithEvents).events.filter(
    (e: any) => e.event === QuestEventTypes.SKILL
  )
  const trainingAttemptEvents = (receipt as TransactionReceiptWithEvents).events.filter(
    (e: any) => e.event === QuestEventTypes.TRAINING_ATTEMPT
  )
  const trainingRatioEvents = (receipt as TransactionReceiptWithEvents).events.filter(
    (e: any) => e.event === QuestEventTypes.TRAINING_RATIO
  )
  const completeEvents = (receipt as TransactionReceiptWithEvents).events.filter(
    (e: any) => e.event === QuestEventTypes.COMPLETE
  )
  const cancelEvents = (receipt as TransactionReceiptWithEvents).events.filter(
    (e: any) => e.event === QuestEventTypes.CANCELED
  )
  let questAddress = ZERO_ONE_ADDRESS

  if (completeEvents.length <= 0 && cancelEvents.length <= 0) {
    dispatch(setQuestFailed(true))
  } else {
    questAddress =
      completeEvents.length > 0
        ? completeEvents[0].args.quest.quest || completeEvents[0].args.quest.questAddress
        : cancelEvents[0].args.quest.quest || cancelEvents[0].args.quest.questAddress
  }

  const heroRewardsMap: any = {}

  // Loop through reward events and map them to the correct heroes
  rewardsOld.forEach((rewardEvent: any) => {
    const item = getItemFromAddress(rewardEvent.args.rewardItem)
    let quantity = Number(rewardEvent.args.itemQuantity)
    const heroId = Number(rewardEvent.args.heroId)

    if (item?.key === ItemKeys.JEWEL_BAG) {
      const bigQuantity = rewardEvent.args.itemQuantity
      quantity = Number.parseFloat(utils.formatEther(bigQuantity))
    }

    if (!heroRewardsMap[heroId]) {
      heroRewardsMap[heroId] = {
        rewards: {}
      }
      if (item) {
        heroRewardsMap[heroId].rewards[item.key as ItemKeys] = {
          ...item,
          quantity
        }
      }
    } else {
      if (item) {
        if (!heroRewardsMap[heroId].rewards[item.key as ItemKeys]) {
          heroRewardsMap[heroId].rewards[item.key as ItemKeys] = {
            ...item,
            quantity
          }
        } else {
          heroRewardsMap[heroId].rewards[item.key as ItemKeys].quantity += quantity
        }
      }
    }
  })

  rewards.forEach((rewardEvent: any) => {
    let item = getItemFromAddress(rewardEvent.args.reward)
    let quantity = Number(rewardEvent.args.amount)
    const heroId = Number(rewardEvent.args.heroId)

    if (item?.key === ItemKeys.JEWEL_BAG) {
      const bigQuantity = rewardEvent.args.itemQuantity
      quantity = Number.parseFloat(utils.formatEther(bigQuantity))
    }

    if (item?.type === ItemType.COLLECTION) {
      const itemIndex = Number(rewardEvent.args.data)
      const subItem = item.collectionItems?.[itemIndex] && itemMap[item.collectionItems[itemIndex]]
      item = subItem ? subItem : item
    }

    if (!heroRewardsMap[heroId]) {
      heroRewardsMap[heroId] = {
        rewards: {}
      }
      if (item) {
        heroRewardsMap[heroId].rewards[item.key as ItemKeys] = {
          ...item,
          quantity
        }
      }
    } else {
      if (item) {
        if (!heroRewardsMap[heroId].rewards[item.key as ItemKeys]) {
          heroRewardsMap[heroId].rewards[item.key as ItemKeys] = {
            ...item,
            quantity
          }
        } else {
          heroRewardsMap[heroId].rewards[item.key as ItemKeys].quantity += quantity
        }
      }
    }
  })

  // Loop through XP events and map to the correct heroes
  xpEvents.forEach((xpEvent: any) => {
    const earnedAmount = Number(xpEvent.args.xpEarned)
    const heroId = Number(xpEvent.args.heroId)

    if (!heroRewardsMap[heroId]) {
      heroRewardsMap[heroId] = {
        xpEarned: earnedAmount
      }
    } else {
      if (heroRewardsMap[heroId].xpEarned) {
        heroRewardsMap[heroId].xpEarned += earnedAmount
      } else {
        heroRewardsMap[heroId].xpEarned = earnedAmount
      }
    }
  })

  // Loop through skill up events and map to the correct heroes
  skillUps.forEach((skillUpEvent: any) => {
    const professionIndex = skillUpEvent.args.profession
    const profession = mapProfessionIndex(Number(professionIndex))
    const points = skillUpEvent.args.skillUp / 10
    const heroId = Number(skillUpEvent.args.heroId)

    if (!heroRewardsMap[heroId]) {
      heroRewardsMap[heroId] = {
        skillUp: {}
      }
      heroRewardsMap[heroId].skillUp[profession] = points
    } else {
      if (heroRewardsMap[heroId].skillUp) {
        if (heroRewardsMap[heroId].skillUp[profession]) {
          heroRewardsMap[heroId].skillUp[profession] += points
        } else {
          heroRewardsMap[heroId].skillUp[profession] = points
        }
      } else {
        heroRewardsMap[heroId].skillUp = {}
        heroRewardsMap[heroId].skillUp[profession] = points
      }
    }
  })

  trainingAttemptEvents.forEach((attemptEvent: any) => {
    const success = attemptEvent.args.success
    const heroId = Number(attemptEvent.args.heroId)

    if (!heroRewardsMap[heroId]) {
      heroRewardsMap[heroId] = {
        performance: {
          marks: []
        }
      }
      heroRewardsMap[heroId].performance.marks.push(success)
    } else {
      if (heroRewardsMap[heroId].performance) {
        heroRewardsMap[heroId].performance.marks.push(success)
      } else {
        heroRewardsMap[heroId].performance = { marks: [] }
        heroRewardsMap[heroId].performance.marks.push(success)
      }
    }
  })

  trainingRatioEvents.forEach((ratioEvent: any) => {
    const attempts = ratioEvent.args.attempts
    const winCount = ratioEvent.args.winCount
    const heroId = Number(ratioEvent.args.heroId)

    if (!heroRewardsMap[heroId]) {
      heroRewardsMap[heroId] = {
        performance: {
          attempts: Number(attempts),
          winCount: Number(winCount)
        }
      }
    } else {
      if (heroRewardsMap[heroId].performance) {
        heroRewardsMap[heroId].performance.attempts = Number(attempts)
        heroRewardsMap[heroId].performance.winCount = Number(winCount)
      } else {
        heroRewardsMap[heroId].performance = {
          attempts: Number(attempts),
          winCount: Number(winCount)
        }
      }
    }
  })

  return { heroRewardsMap, questAddress }
}

export function generatePerformanceDialog(
  heroRewardsMap: HeroRewardsMap,
  performanceDialogueMap: GetPerformanceDialogueMap,
  heroes: Hero[]
) {
  if (!heroes.length) return ''
  const index = getRandomIndex(heroes.length)
  const randomHero = heroes[index]
  const randomHeroId = String(randomHero.id)
  const randomHeroDialogue = performanceDialogueMap(randomHero.name)
  const percent = Math.floor(
    (heroRewardsMap[randomHeroId].performance.winCount / heroRewardsMap[randomHeroId].performance.attempts) * 100
  )

  if (percent === 100) {
    return randomHeroDialogue.good
  } else if (percent >= 50) {
    return randomHeroDialogue.fair
  } else if (percent < 50 && percent > 0) {
    return randomHeroDialogue.poor
  } else {
    return randomHeroDialogue.bad
  }
}

export function generateContextualRewardDialogue(
  heroRewardsMap: HeroRewardsMap,
  dialogueMap?: RewardsDialogueMap,
  providerKey?: QuestProviderKeys,
  questFailed?: boolean
): string {
  if (!dialogueMap || !providerKey) return ''

  const standardRewardsArray: Reward[] = []
  const runeArray: Reward[] = []
  const tearsArray: Reward[] = []
  const eggArray: Reward[] = []

  Object.entries(heroRewardsMap).forEach(([_, heroRewards]) => {
    if (heroRewards.rewards) {
      Object.entries(heroRewards.rewards).forEach(([_, reward]) => {
        if (reward.type === ItemType.RUNE) {
          runeArray.push(reward)
        } else if (reward.key === ItemKeys.GAIASTEARS) {
          tearsArray.push(reward)
        } else if (reward.type === ItemType.PET) {
          eggArray.push(reward)
        } else if (reward.quantity > 0) {
          standardRewardsArray.push(reward)
        }
      })
    }
  })

  // Quest failure
  if (questFailed) {
    return dialogueMap.questFailedMessage
  }

  // Find an egg (rare)
  if (eggArray.length > 0) {
    return dialogueMap.eggMessage
  }

  // Standard item dialogue plus combo, if applicable
  if (standardRewardsArray.length > 0) {
    const index = getRandomIndex(standardRewardsArray.length)
    const randomItemKey = standardRewardsArray[index].key
    const questProviderDialogue = questProviderMap[providerKey].itemDialogueMap[randomItemKey]
    let messageObject = questProviderDialogue || ''

    if (runeArray.length > 0) {
      messageObject += `<br /><br />${dialogueMap.runesComboMessage}`
    } else if (tearsArray.length > 0) {
      messageObject += `<br /><br />${dialogueMap.tearsComboMessage}`
    }

    return messageObject
    // Only find tears or runes
  } else {
    if (tearsArray.length > 0 || runeArray.length > 0) {
      return dialogueMap.tearsOrRunesOnlyMessage
    }
  }

  return dialogueMap.noRewardMessage
}

export async function handleEndedQuest(receipt: TransactionReceipt) {
  const heroCore = getHeroCore()
  const { profile } = store.getState().profile
  const { heroRewardsMap, questAddress } = getRewardsFromReceipt(receipt)

  // Loop through heroes and update with heroRewardsMap
  for (const [heroId] of Object.entries(heroRewardsMap)) {
    const heroFiltered = store.getState().heroes.userHeroes.filter((hero: Hero) => {
      return Number(hero.id) === Number(heroId)
    })
    const hero = heroFiltered[0]

    if (hero) {
      try {
        const coreHero = await heroCore.getHero(hero.id)
        const updatedHero = buildContractHero(coreHero, profile)
        updatedHero.currentStamina = calculateRemainingStamina(updatedHero)

        dispatch(updateHero(updatedHero))
      } catch (error) {
        console.log(error)
      }
    }
  }

  dispatch(setQuestRewardAddress(questAddress))
  dispatch(setHeroRewardsMap(heroRewardsMap))
}

export const printActiveQuestInfo = async (account: string) => {
  const heroCore = getHeroCore()
  const questCore = getQuestCoreOld()

  try {
    const rawActiveQuests = await questCore.getActiveQuests(account)
    const activeQuests: Array<ActiveQuest> = []

    for (let i = 0; i < rawActiveQuests.length; i++) {
      const rawQuest = rawActiveQuests[i]
      let activeData

      try {
        activeData = await questCore.getQuestData(rawQuest.id)
      } catch (error) {}

      const { id, quest, heroes, attempts, completeAtTime, startTime } = rawQuest
      const mappedHeroes = heroes.map((hero: BigNumber) => Number(hero))
      const bigCompletedAt = BigNumber.from(completeAtTime)
      const completeAtTimeFinal = DateTime.fromSeconds(bigCompletedAt.toNumber())
      const bigStartTime = BigNumber.from(startTime)
      const startTimeFinal = DateTime.fromSeconds(bigStartTime.toNumber())
      const { userHeroes } = store.getState().heroes

      const generatedHeroes = []

      for (let i = 0; i < mappedHeroes.length; i++) {
        const heroId = mappedHeroes[i]
        const localHero = userHeroes.filter((hero: Hero) => hero.id === heroId)[0]

        if (typeof localHero !== 'undefined') {
          generatedHeroes.push(localHero)
        } else {
          try {
            const coreHero = await heroCore?.getHero(heroId)
            const builtHero = buildContractHero(coreHero, null)

            if (builtHero) {
              generatedHeroes.push(builtHero)
            }
          } catch (error) {
            console.log(error)
          }
        }
      }

      activeQuests.push({
        id: Number(id),
        questAddress: quest.toLowerCase(),
        heroes: generatedHeroes,
        attempts,
        completeAtTime: completeAtTimeFinal,
        startTime: startTimeFinal,
        activeData
      })
    }

    console.log({ activeQuests })
  } catch (error) {
    throw error
  }
}
