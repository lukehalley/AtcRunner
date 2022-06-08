import { useEffect, useState, useRef, memo } from 'react'
import { useDispatch } from 'react-redux'
import { TransactionResponse } from '@ethersproject/providers'
import { setShowHeroDetailsModal } from 'features/heroHub/state'
import { ActiveModalType } from 'features/heroHub/types'
import { convertHeroId } from 'features/heroes/utils'
import { useSelector } from 'features/hooks'
import { Profile } from 'features/profile/types'
import { GEN0_REROLL_ADDRESSES } from 'features/reroll/constants'
import { useTransactionAdder } from 'features/transactions/hooks'
import { useActiveWeb3React } from 'hooks'
import styled from 'styled-components/macro'
import { isHarmonyHook, setGas } from 'utils'
import colors from 'utils/colors'
import { getHeroCore, getSaleAuctionCore } from 'utils/contracts'
import { Hero } from 'utils/dfkTypes'
import errorHandler from 'utils/errorHandler'
import { DKModal } from '../../../DKModal'
import HeroContainer from '../HeroContainer'
import BuyHeroConfirm from './components/BuyHeroConfirm'
import HireHeroConfirm from './components/HireHeroConfirm'
import RentHeroConfirm from './components/RentHeroConfirm'
import SellHeroConfirm from './components/SellHeroConfirm'
import ViewHeroConfirm from './components/ViewHeroConfirm'

interface HeroListProps {
  list: Hero[]
}

const HeroList: React.FC<HeroListProps> = ({ list }: HeroListProps) => {
  const { account, chainId } = useActiveWeb3React()
  const dispatch = useDispatch()
  const addTransaction = useTransactionAdder()
  const heroCore = getHeroCore({ account, chainId })
  const saleAuction = getSaleAuctionCore({ account, chainId })
  const { activeModalType, heroDetailsModalTitle, showHeroDetailsModal } = useSelector(s => s.heroHub)
  const [saleApproved, setSaleApproved] = useState(false)
  const [transactionType, setTransactionType] = useState('public')
  const [privateRecipientAddress, setPrivateRecipientAddress] = useState('')
  const [privateRecipientProfile, setPrivateRecipientProfile] = useState<Profile | null>(null)
  const [transactionStyle, setTransactionStyle] = useState('fixed')
  const [transactionProcessing, setTransactionProcessing] = useState(false)

  const saleApproveCallback = async () => {
    setTransactionProcessing(true)
    if (heroCore && saleAuction) {
      try {
        const args = [saleAuction.address, true] as const
        const response: TransactionResponse = isHarmonyHook(chainId)
          ? await heroCore.setApprovalForAll(...args, setGas())
          : await heroCore.setApprovalForAll(...args)

        addTransaction(response, {
          summary: `Approve Sales`
        })

        await response.wait(1).then(() => {
          setSaleApproved(true)
        })
      } catch (error) {
        errorHandler(error)
      }
    }
    setTransactionProcessing(false)
  }

  const safeToUpdateStateRef = useRef(false)
  useEffect(() => {
    getSaleApproval()
    safeToUpdateStateRef.current = true

    return () => {
      safeToUpdateStateRef.current = false
    }
  }, [])

  const getSaleApproval = async () => {
    if (heroCore && saleAuction && account) {
      try {
        const isApproved = await heroCore.isApprovedForAll(account, saleAuction.address)
        safeToUpdateStateRef.current && setSaleApproved(isApproved)
      } catch (error) {
        console.log('error getting sale approval', error)
      }
    }
  }

  const handleTransactionTypeChange = (type: string) => {
    setTransactionType(type)
    setPrivateRecipientAddress('')
    setPrivateRecipientProfile(null)

    if ((type = 'public')) {
      setTransactionStyle('fixed')
    }
  }

  const handleTransactionStyleChange = (style: string) => {
    setTransactionStyle(style)
  }

  return (
    <>
      <DKModal
        showModal={showHeroDetailsModal}
        setShowModal={() => dispatch(setShowHeroDetailsModal(false))}
        title={heroDetailsModalTitle}
        maxWidth={1000}
      >
        {activeModalType === ActiveModalType.sell && (
          <SellHeroConfirm
            handleTransactionTypeChange={handleTransactionTypeChange}
            handleTransactionStyleChange={handleTransactionStyleChange}
            privateRecipientProfile={privateRecipientProfile}
            privateRecipientAddress={privateRecipientAddress}
            saleApproved={saleApproved}
            saleApproveCallback={saleApproveCallback}
            setPrivateRecipientAddress={setPrivateRecipientAddress}
            setPrivateRecipientProfile={setPrivateRecipientProfile}
            transactionProcessing={transactionProcessing}
            transactionType={transactionType}
            transactionStyle={transactionStyle}
          />
        )}
        {activeModalType === ActiveModalType.rent && (
          <RentHeroConfirm
            handleTransactionTypeChange={handleTransactionTypeChange}
            privateRecipientProfile={privateRecipientProfile}
            privateRecipientAddress={privateRecipientAddress}
            saleApproved={saleApproved}
            saleApproveCallback={saleApproveCallback}
            setPrivateRecipientAddress={setPrivateRecipientAddress}
            setPrivateRecipientProfile={setPrivateRecipientProfile}
            transactionProcessing={transactionProcessing}
            transactionType={transactionType}
          />
        )}
        {activeModalType === ActiveModalType.hire && <HireHeroConfirm />}
        {activeModalType === ActiveModalType.buy && <BuyHeroConfirm />}
        {(activeModalType === ActiveModalType.catalog ||
          activeModalType === ActiveModalType.view ||
          activeModalType === ActiveModalType.quest ||
          activeModalType === ActiveModalType.portal ||
          activeModalType === ActiveModalType.applyItem ||
          activeModalType === ActiveModalType.send ||
          activeModalType === ActiveModalType.level) && <ViewHeroConfirm />}
      </DKModal>

      {list.map((hero: Hero) => {
        return (
          <div
            key={Number(hero.id)}
            className="buy-heroes-list-box bordered-box-thin"
            style={{ width: '100%', maxWidth: '600px', height: '100%' }}
          >
            <Grid2>
              <div>#{convertHeroId(hero.id)}</div>
              <div className="align-right">
                {hero.price > 0 && <ForSale private={hero.winner}>{hero.winner ? 'Private Sale' : 'For Sale'}</ForSale>}
                {hero.summoningPrice > 0 && <SummonAssist>{hero.winner ? 'Private Hire' : 'For Hire'}</SummonAssist>}
                {hero.isQuesting && (
                  <SummonAssist isQuesting={hero.isQuesting}>
                    {chainId && hero.currentQuest === GEN0_REROLL_ADDRESSES[chainId] ? 'Pending Reroll' : 'On a Quest'}
                  </SummonAssist>
                )}
              </div>
            </Grid2>

            <HeroContainer hero={hero} />
          </div>
        )
      })}
    </>
  )
}

export default memo(HeroList)

const Grid2 = styled.div.attrs(props => ({
  className: 'grid-2'
}))`
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 10px;
  max-width: 300px;
  margin: 0 auto;
`

const ForSale = styled.div.attrs((props): any => ({
  className: 'tag-sale'
}))`
  font-weight: 400;
  color: white;
  background: ${props => (props.private ? colors.purpleTag : colors.greenTag)};
  text-transform: uppercase;
  font-size: 10px;
  width: inherit;
  display: inline-block;
  letter-spacing: 1px;
  padding: 3px 10px;
  margin-left: 6px;
`

const SummonAssist = styled.div.attrs((props): any => ({
  className: 'summon-assist'
}))`
  font-weight: 400;
  color: white;
  background: ${props => (props.isQuesting ? '#B74E26' : colors.redTag)};
  text-transform: uppercase;
  font-size: 10px;
  width: inherit;
  display: inline-block;
  letter-spacing: 1px;
  padding: 3px 10px;
  margin-left: 6px;
`
