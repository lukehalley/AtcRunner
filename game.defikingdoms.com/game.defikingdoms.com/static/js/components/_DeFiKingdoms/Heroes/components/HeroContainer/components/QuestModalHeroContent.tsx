import { MouseEventHandler } from 'react'
import { Button } from 'components/Buttons'
import { calculateRemainingStamina } from 'components/_DeFiKingdoms/Heroes/utils/staminaCalculations'
import GOVERNANCE_TOKEN_INTERFACE from 'constants/abis/governanceToken'
import { TokenAmount } from 'constants/sdk-extra'
import { setShowHeroHub } from 'features/heroHub/state'
import { getHeroStatByKey } from 'features/heroes/utils'
import { useDispatch, useSelector } from 'features/hooks'
import { addSelectedHeroes, removeSelectedHero } from 'features/quests/state'
import { QuestKeys, QuestType } from 'features/quests/types'
import { calculateMaxJEWELUnlockRate, calculateTotalJEWELUnlockRate, isAttemptBased } from 'features/quests/utils'
import { useTokenBalance } from 'features/wallet/hooks'
import { getAccount } from 'features/web3/utils'
import useGovernanceToken from 'hooks/useGovernanceToken'
import styled from 'styled-components/macro'
import { Hero } from 'utils/dfkTypes'
import HeroDetailActions from './HeroDetailActions'
import LazyHeroCard from './LazyHeroCard'

interface QuestModalHeroContentProps {
  handleFlipButtonClicked: MouseEventHandler<Element>
  hero: Hero
  isFlipped: boolean
}

const QuestModalHeroContent = ({ handleFlipButtonClicked, hero, isFlipped }: QuestModalHeroContentProps) => {
  const dispatch = useDispatch()
  const account = getAccount()
  const govToken = useGovernanceToken()
  const govTokenLockedBalance: TokenAmount | undefined = useTokenBalance(
    account ?? undefined,
    govToken,
    'lockOf',
    GOVERNANCE_TOKEN_INTERFACE
  )
  const remainingStamina = calculateRemainingStamina(hero)
  const { selectedHeroes, questData } = useSelector(s => s.quests)
  const { allAnimated } = useSelector(s => s.heroHub)
  const { baseStaminaCost, key, proficientStaminaCost, proficiencyType, trainingStat, type } = questData
  const heroProfession = hero.statGenes.profession
  const hasMatchingProficiencyType = proficiencyType === heroProfession
  const isAlreadySelected = selectedHeroes.some(selectedHero => selectedHero.id === hero.id)
  const isForSale = hero.price > 0
  const staminaCost = hasMatchingProficiencyType ? proficientStaminaCost : baseStaminaCost
  const notEnoughStamina = isAttemptBased(type) ? staminaCost > remainingStamina : remainingStamina < 1
  const isButtonDisabled = isForSale || notEnoughStamina || hero.isQuesting
  const isJEWELMining = key === QuestKeys.JEWEL_MINING_0
  const maxUnlockRate =
    selectedHeroes.length > 0 && govTokenLockedBalance
      ? calculateMaxJEWELUnlockRate(selectedHeroes[0], govTokenLockedBalance)
      : 0
  const selectedHeroTotalRate = govTokenLockedBalance
    ? calculateTotalJEWELUnlockRate(selectedHeroes, maxUnlockRate, govTokenLockedBalance)
    : 0
  const buttonText = isForSale
    ? 'Listed For Sale'
    : hero.isQuesting
    ? 'Already Questing'
    : notEnoughStamina
    ? 'Not enough stamina'
    : isAlreadySelected
    ? 'Deselect Hero'
    : isJEWELMining && selectedHeroes.length <= 0
    ? `Select Lead Miner (${hasMatchingProficiencyType ? proficientStaminaCost : baseStaminaCost} stamina)`
    : `Select Hero (${hasMatchingProficiencyType ? proficientStaminaCost : baseStaminaCost} stamina)`

  const handleSelectHeroQuestButtonClick = () => {
    if (questData.maxHeroes <= 1) {
      dispatch(setShowHeroHub(false))
    }
    if (isAlreadySelected) {
      dispatch(removeSelectedHero(hero))
    } else {
      dispatch(addSelectedHeroes({ hero: [hero], maxHeroes: questData.maxHeroes }))
    }
  }

  return (
    <>
      <CardStatus disabled={isButtonDisabled || isAlreadySelected}>
        <LazyHeroCard hero={hero} isAnimated={allAnimated} isFlipped={isFlipped} />
      </CardStatus>

      {proficiencyType && (
        <InfoWrapper hasMatchingProficiencyType={hasMatchingProficiencyType}>
          <h4>Profession:</h4>
          <p>{heroProfession[0].toUpperCase() + heroProfession.slice(1)}</p>
        </InfoWrapper>
      )}
      {isJEWELMining && selectedHeroes.length <= 0 && (
        <>
          {govTokenLockedBalance && (
            <UnlockRate>
              Max JEWEL unlock rate: <br />
              <span>{calculateMaxJEWELUnlockRate(hero, govTokenLockedBalance).toFixed(6)} JEWEL per tick</span>
            </UnlockRate>
          )}
        </>
      )}
      {isJEWELMining && selectedHeroes.length >= 1 && (
        <>
          {govTokenLockedBalance && (
            <UnlockRate>
              Total Rate / Max Rate
              <br />
              <span>
                {selectedHeroTotalRate.toFixed(6)} / {maxUnlockRate.toFixed(6)}
              </span>
            </UnlockRate>
          )}
        </>
      )}
      {isJEWELMining && selectedHeroes.length >= 1 && !isAlreadySelected && selectedHeroTotalRate < maxUnlockRate && (
        <>
          {govTokenLockedBalance && (
            <UnlockRate>
              Additional JEWEL unlock rate <br />
              <span>
                {calculateTotalJEWELUnlockRate([hero], maxUnlockRate, govTokenLockedBalance).toFixed(6)} JEWEL per tick
              </span>
            </UnlockRate>
          )}
        </>
      )}
      {type === QuestType.AttemptBasedTraining && trainingStat && (
        <InfoWrapper hasMatchingProficiencyType={true}>
          <h4>Primary Training Stat:</h4>
          <span style={{ textTransform: 'capitalize' }}>
            {getHeroStatByKey(hero, trainingStat)} {trainingStat}
          </span>
        </InfoWrapper>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Button
          type="small"
          disabled={isButtonDisabled}
          onClick={isButtonDisabled ? undefined : handleSelectHeroQuestButtonClick}
        >
          {buttonText}
        </Button>
      </div>
      <HeroDetailActions hero={hero} handleFlipButtonClicked={handleFlipButtonClicked} />
    </>
  )
}

export default QuestModalHeroContent

interface CardStatusProps {
  disabled: boolean
}

const CardStatus = styled.div<CardStatusProps>`
  opacity: ${props => (!props.disabled ? 1 : 0.5)};
`

interface InfoWrapperProps {
  hasMatchingProficiencyType: boolean
}

const UnlockRate = styled.p`
  font-size: 14px;
  font-weight: bold;
  text-align: center;

  span {
    font-weight: 400;
  }
`

const InfoWrapper = styled.div<InfoWrapperProps>`
  text-align: center;

  h4 {
    margin: 0;
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.8);
  }

  p {
    margin: 0;
    font-size: 12px;
    font-weight: bold;
    color: ${props => (props.hasMatchingProficiencyType ? '#14C25A' : '#fac05d')};

    &:before {
      content: '•';
      display: ${props => (props.hasMatchingProficiencyType ? 'inline-block' : 'none')};
      margin-right: 4px;
    }
  }

  span {
    margin: 5px 0 0;
    font-size: 13px;
    font-weight: bold;
  }
`
