import { useState } from 'react'
import { Button } from 'components/Buttons'
import CuteJewel from 'components/CuteJewel'
import { handleCancelRental } from 'features/heroHub/contracts'
import { useTransactionAdder } from 'features/transactions/hooks'
import { useActiveWeb3React } from 'hooks'
import { Hero } from 'utils/dfkTypes'

interface ShowRentPriceProps {
  hero: Hero
}

const ShowRentPrice = ({ hero }: ShowRentPriceProps) => {
  const { chainId } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()
  const [transactionProcessing, setTransactionProcessing] = useState(false)

  const handleCancelRentalLocal = () => {
    handleCancelRental(hero, addTransaction, setTransactionProcessing, chainId)
  }

  return (
    <>
      <div className="price" style={{ paddingBottom: '15px' }}>
        <CuteJewel />
        {hero.summoningPrice}
      </div>
      <Button
        type="ghost"
        containerStyle={{ width: 'auto' }}
        onClick={handleCancelRentalLocal}
        loading={transactionProcessing}
        loadingColor="#fac05d"
        disabled={transactionProcessing}
      >
        Cancel Hiring
      </Button>
    </>
  )
}

export default ShowRentPrice
