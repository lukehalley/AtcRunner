import { useEffect, useState } from 'react'
import { Button } from 'components/Buttons'
import CuteJewel from 'components/CuteJewel'
import { handleCancelSale } from 'features/heroHub/contracts'
import { calculateCurrentAuctionPrice } from 'features/heroes/utils'
import { useTransactionAdder } from 'features/transactions/hooks'
import { Hero } from 'utils/dfkTypes'

interface ShowSalePriceProps {
  hero: Hero
}

const ShowSalePrice = ({ hero }: ShowSalePriceProps) => {
  const addTransaction = useTransactionAdder()
  const [transactionProcessing, setTransactionProcessing] = useState(false)

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
      <div className="price" style={{ paddingBottom: '15px' }}>
        <CuteJewel />
        {salePrice}
      </div>
      <Button
        type="ghost"
        onClick={handleCancelSaleLocal}
        loading={transactionProcessing}
        loadingColor="#fac05d"
        disabled={transactionProcessing}
      >
        Cancel Sale
      </Button>
    </>
  )
}

export default ShowSalePrice
