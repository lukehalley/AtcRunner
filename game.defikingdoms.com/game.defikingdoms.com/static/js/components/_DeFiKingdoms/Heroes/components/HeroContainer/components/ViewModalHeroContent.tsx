import { MouseEventHandler, useEffect, useState } from 'react'
import { faGavel } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Tooltip } from '@material-ui/core'
import { Button } from 'components/Buttons'
import CuteJewel from 'components/CuteJewel'
import { handleCancelRental, handleCancelSale } from 'features/heroHub/contracts'
import { calculateCurrentAuctionPrice } from 'features/heroes/utils'
import { useSelector } from 'features/hooks'
import { handleCompleteHungQuest } from 'features/quests/contracts'
import { getQuestFromAddress } from 'features/quests/utils'
import { GEN0_REROLL_ADDRESSES } from 'features/reroll/constants'
import { useTransactionAdder } from 'features/transactions/hooks'
import { useActiveWeb3React } from 'hooks'
import styled from 'styled-components'
import { Hero } from 'utils/dfkTypes'
import HeroDetailActions from './HeroDetailActions'
import LazyHeroCard from './LazyHeroCard'

interface ViewModalHeroContentProps {
  handleFlipButtonClicked: MouseEventHandler
  hero: Hero
  isFlipped: boolean
}

const ViewModalHeroContent = ({ handleFlipButtonClicked, hero, isFlipped }: ViewModalHeroContentProps) => {
  const addTransaction = useTransactionAdder()
  const { account, chainId } = useActiveWeb3React()
  const { allAnimated } = useSelector(s => s.heroHub)
  const { activeQuests } = useSelector(s => s.quests)
  const [completeProcessing, setCompleteProcessing] = useState(false)
  const [transactionProcessing, setTransactionProcessing] = useState(false)
  // const [cancelProcessing, setCancelProcessing] = useState(false)
  const hasActiveQuest = activeQuests.some(activeQuest => {
    return activeQuest.heroes.some((questHero: Hero) => {
      return questHero.id === hero.id
    })
  })

  const handleCancelRentalLocal = () => {
    handleCancelRental(hero, addTransaction, setTransactionProcessing, chainId)
  }

  const handleCancelSaleLocal = () => {
    handleCancelSale(hero, addTransaction, setTransactionProcessing)
  }

  // Poll for current pricing
  const [, setTime] = useState(Date.now())
  useEffect(() => {
    if (!hero.auction || !hero.auction.onAuction) return
    const pollInterval = 1000
    const interval = setInterval(() => {
      setTime(Date.now())
    }, pollInterval)

    return () => {
      clearInterval(interval)
    }
  }, [])

  // const handleCancelQuestLocal = () => {
  //   const currentQuest = hero.currentQuest && getQuestFromAddress(hero.currentQuest)
  //   handleCancelQuest(hero, addTransaction, setCancelProcessing, currentQuest || undefined)
  // }

  const handleQuestCompleteLocal = () => {
    const currentQuest = hero.currentQuest && getQuestFromAddress(hero.currentQuest)
    handleCompleteHungQuest(hero, addTransaction, setCompleteProcessing, currentQuest || undefined)
  }

  let salePrice = hero.price
  if (hero.auction && hero.auction.onAuction) {
    salePrice = calculateCurrentAuctionPrice(
      hero.auction.startingPrice,
      hero.auction.endingPrice,
      hero.auction.startedAt,
      hero.auction.duration
    )
  }

  return (
    <>
      <LazyHeroCard isAnimated={allAnimated} hero={hero} isFlipped={isFlipped} />
      <div style={{ textAlign: 'center', margin: '0 auto' }}>
        <HeroDetailActions hero={hero} handleFlipButtonClicked={handleFlipButtonClicked} />
        {hero.isQuesting &&
          hero.currentQuest &&
          chainId &&
          hero.currentQuest !== GEN0_REROLL_ADDRESSES[chainId] &&
          account?.toLowerCase() === hero.owner.owner.toLowerCase() &&
          !hasActiveQuest && (
            <ActionRow>
              {/* <Button
              type="ghost"
              onClick={handleCancelQuestLocal}
              loadingColor="#fac05d"
              loading={cancelProcessing}
              disabled={cancelProcessing}
              fullWidth
            >
              Cancel Quest
            </Button> */}
              <Button
                type="ghost"
                onClick={handleQuestCompleteLocal}
                loadingColor="#fac05d"
                loading={completeProcessing}
                disabled={completeProcessing}
                fullWidth
              >
                Complete Quest
              </Button>
            </ActionRow>
          )}
        {hero.price > 0 && account?.toLowerCase() === hero.owner.owner.toLowerCase() && (
          <>
            <div className="price">
              <CuteJewel />
              {salePrice}{' '}
              {hero.auction && hero.auction.onAuction ? (
                <Tooltip title="Auction prices change as time elapses. Final transaction price may be different than price shown.">
                  <span>
                    <FontAwesomeIcon icon={faGavel} size="xs" color="green" />
                  </span>
                </Tooltip>
              ) : null}
            </div>
            <Button
              type="ghost"
              containerStyle={{ display: 'inline-block', margin: '0 auto 10px' }}
              onClick={handleCancelSaleLocal}
              loadingColor="#fac05d"
              loading={transactionProcessing}
              disabled={transactionProcessing}
            >
              Cancel Sale
            </Button>
          </>
        )}
        {hero.summoningPrice > 0 && account?.toLowerCase() === hero.owner.owner.toLowerCase() && (
          <>
            <div className="price">
              <CuteJewel />
              {hero.summoningPrice}
            </div>
            <Button
              type="ghost"
              containerStyle={{ width: 'auto', margin: '0 auto 10px' }}
              onClick={handleCancelRentalLocal}
              loadingColor="#fac05d"
              loading={transactionProcessing}
              disabled={transactionProcessing}
            >
              Cancel Hiring
            </Button>
          </>
        )}
      </div>
    </>
  )
}

export default ViewModalHeroContent

const ActionRow = styled.div.attrs(props => ({
  className: 'action-row'
}))`
  display: flex;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 10px;
  max-width: 170px;
  margin: 0 auto 6px;
  justify-content: center;

  button {
    white-space: nowrap;
  }
`
