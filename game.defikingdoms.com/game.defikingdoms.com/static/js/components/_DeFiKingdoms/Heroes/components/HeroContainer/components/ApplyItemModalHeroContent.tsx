import { useState } from 'react'
import { MouseEventHandler } from 'react'
import { Button } from 'components/Buttons'
import { ZERO_ONE_ADDRESS } from 'constants/index'
import { Token, TokenAmount } from 'constants/sdk-extra'
import { useSelector } from 'features/hooks'
import { handleConsumeItem } from 'features/items/contracts'
import { ItemKeys } from 'features/items/types'
import { getItemToken } from 'features/items/utils'
import { useTransactionAdder } from 'features/transactions/hooks'
import { getChainId } from 'features/web3/utils'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { DateTime } from 'luxon'
import styled from 'styled-components/macro'
import { getItemConsumerCore } from 'utils/contracts'
import { Hero } from 'utils/dfkTypes'
import HeroDetailActions from './HeroDetailActions'
import LazyHeroCard from './LazyHeroCard'

interface ApplyItemModalHeroContentProps {
  handleFlipButtonClicked: MouseEventHandler<Element>
  hero: Hero
  isFlipped: boolean
}

const ApplyItemModalHeroContent = ({ handleFlipButtonClicked, hero, isFlipped }: ApplyItemModalHeroContentProps) => {
  const chainId = getChainId()
  const addTransaction = useTransactionAdder()
  const itemConsumerCore = getItemConsumerCore()
  const [transactionProcessing, setTransactionProcessing] = useState()
  const { consumableItem } = useSelector(s => s.items)
  const { allAnimated } = useSelector(s => s.heroHub)
  const itemToken = consumableItem ? getItemToken(consumableItem) : new Token(chainId, ZERO_ONE_ADDRESS, 0)
  const [itemTokenApproval, itemTokenApprovalCallback] = useApproveCallback(
    new TokenAmount(itemToken, BigInt('9999999')),
    itemConsumerCore?.address
  )

  const triggerItemEvent = () => {
    if (consumableItem) {
      handleConsumeItem(consumableItem, hero, addTransaction, setTransactionProcessing)
    }
  }

  const heroFull = consumableItem?.key === ItemKeys.STAMINA_POTION && DateTime.now() >= hero.staminaFullAt
  const cardDisabled = hero.price > 0 || hero.summoningPrice > 0 || hero.isQuesting || heroFull
  const selectButtonHidden =
    hero.price > 0 ||
    hero.summoningPrice > 0 ||
    hero.isQuesting ||
    heroFull ||
    itemTokenApproval !== ApprovalState.APPROVED

  return (
    <>
      <CardStatus disabled={cardDisabled}>
        <LazyHeroCard hero={hero} isAnimated={allAnimated} isFlipped={isFlipped} />
      </CardStatus>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        {hero.price > 0 && (
          <Button type="small" disabled>
            Listed For Sale
          </Button>
        )}
        {hero.summoningPrice > 0 && (
          <Button type="small" disabled>
            Listed For Hire
          </Button>
        )}
        {itemTokenApproval !== ApprovalState.APPROVED && (
          <Button
            type="small"
            onClick={itemTokenApprovalCallback}
            disabled={itemTokenApproval === ApprovalState.PENDING}
            loading={itemTokenApproval === ApprovalState.PENDING}
          >
            Approve Item Use
          </Button>
        )}
        {heroFull && (
          <Button type="small" disabled>
            Stamina Full
          </Button>
        )}
        {hero.isQuesting && (
          <Button type="small" disabled>
            Currently Questing
          </Button>
        )}
        {!selectButtonHidden && (
          <Button
            type="small"
            onClick={triggerItemEvent}
            disabled={transactionProcessing}
            loading={transactionProcessing}
          >
            Select Hero
          </Button>
        )}
      </div>
      <HeroDetailActions hero={hero} handleFlipButtonClicked={handleFlipButtonClicked} />
    </>
  )
}

export default ApplyItemModalHeroContent

interface CardStatusProps {
  disabled: boolean
}

const CardStatus = styled.div<CardStatusProps>`
  opacity: ${props => (!props.disabled ? 1 : 0.5)};
`
