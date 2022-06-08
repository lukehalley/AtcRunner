import { MouseEventHandler, useEffect, useState } from 'react'
import { faGavel } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Tooltip } from '@material-ui/core'
import { Button } from 'components/Buttons'
import CuteJewel from 'components/CuteJewel'
import { setHeroDetailsModalHero, setHeroDetailsModalTitle, setShowHeroDetailsModal } from 'features/heroHub/state'
import { calculateCurrentAuctionPrice, convertHeroId } from 'features/heroes/utils'
import { useDispatch, useSelector } from 'features/hooks'
import moment from 'moment'
import { capitalizeFirstLetter } from 'utils/capitalizeFirstLetter'
import { Hero } from 'utils/dfkTypes'
import HeroDetailActions from './HeroDetailActions'
import LazyHeroCard from './LazyHeroCard'
import SummonTimer from './SummonTimer'

interface BuyModalHeroContentProps {
  handleFlipButtonClicked: MouseEventHandler
  hero: Hero
  isFlipped: boolean
}

const BuyModalHeroContent = ({ handleFlipButtonClicked, hero, isFlipped }: BuyModalHeroContentProps) => {
  // Poll for current pricing
  const dispatch = useDispatch()
  const [, setTime] = useState(Date.now())
  const { allAnimated } = useSelector(s => s.heroHub)
  const countDownDate = moment
    .utc(hero.nextSummonTime.ts)
    .zone('-08:00') // Denver Time Zone
    .toDate()

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

  const handleHeroBuyClick = () => {
    dispatch(setShowHeroDetailsModal(true))
    dispatch(setHeroDetailsModalTitle(`#${convertHeroId(hero.id)} — ${capitalizeFirstLetter(hero.name)}`))
    dispatch(setHeroDetailsModalHero(hero))
  }

  const salePrice =
    hero.auction && hero.auction.onAuction
      ? calculateCurrentAuctionPrice(
          hero.auction.startingPrice,
          hero.auction.endingPrice,
          hero.auction.startedAt,
          hero.auction.duration
        )
      : hero.price

  return (
    <>
      <LazyHeroCard hero={hero} isAnimated={allAnimated} isFlipped={isFlipped} />
      {countDownDate && countDownDate > moment().toDate() && (
        <>
          <p style={{ fontSize: 10, textAlign: 'center', margin: 0 }}>Summon Cooldown</p>
          <SummonTimer countDownTime={countDownDate}>{<></>}</SummonTimer>
        </>
      )}
      <HeroDetailActions hero={hero} handleFlipButtonClicked={handleFlipButtonClicked} />
      <div className="pricing align-center" style={{ display: `${hero.price ? 'auto' : 'hidden'}` }}>
        <span>Hero Price</span>
        <br />
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
        <Button type="small" onClick={handleHeroBuyClick}>
          Buy Hero
        </Button>
      </div>
    </>
  )
}

export default BuyModalHeroContent
