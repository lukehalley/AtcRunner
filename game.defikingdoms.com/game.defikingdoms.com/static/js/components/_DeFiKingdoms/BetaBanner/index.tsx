import { useState } from 'react'
import { DKModal } from 'components/_DeFiKingdoms/DKModal'
import styled from 'styled-components'
import { Button } from '../../Buttons'

const BannerMain = styled.div.attrs(props => ({
  className: 'banner-main'
}))`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
`

const BannerContainer = styled.div.attrs(props => ({
  className: 'banner-container'
}))`
  text-align: center;
  display: flex;
  flex-direction: column;
`

const BannerText = styled.p.attrs(props => ({
  className: 'banner-text'
}))`
  width: 100%;
  text-align: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  align-self: center;
  margin: 20px;
`

const BetaBanner = () => {
  const currentTime = new Date().getTime()
  const [acknowledged, setAcknowledged] = useState(
    currentTime - Number(localStorage.getItem('betaAck')) < 24 * 60 * 60 * 1000
  )

  const betaBannerClickHandler = () => {
    const date = new Date().getTime()
    localStorage.setItem('betaAck', String(date))
    setAcknowledged(true)
  }

  return !acknowledged && window.location.hostname === 'beta.defikingdoms.com' ? (
    <DKModal
      title="You are currently using the beta site of DeFi Kingdoms."
      showModal={!acknowledged}
      setShowModal={betaBannerClickHandler}
      maxWidth={1200}
    >
      <BannerMain>
        <BannerContainer>
          <BannerText>
            The beta site is used to test future game updates. Game features may not function as intended. The beta site
            uses your real tokens and NFTs. Any and all transactions made on this site occur in real time in your
            wallet. Consider carefully before participating in Beta testing. Beta test features are used for balance
            testing and are not guaranteed to be implemented. Be careful before making financial decisions based on Beta
            test mechanics. All mechanics in DeFi Kingdoms are subject to change in future updates.
          </BannerText>
          <Button onClick={betaBannerClickHandler}>I Understand</Button>
        </BannerContainer>
      </BannerMain>
    </DKModal>
  ) : null
}

export default BetaBanner
