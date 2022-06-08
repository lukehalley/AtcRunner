import { memo } from 'react'
import SpriteBubble from 'components/_DeFiKingdoms/_helpers/sprites/SpriteBubble'
import SpriteDynamic from 'components/_DeFiKingdoms/_helpers/sprites/SpriteDynamic'
import Events from 'components/_DeFiKingdoms/_helpers/sprites/SpriteEventBus'
import GridTiles from 'components/_DeFiKingdoms/_helpers/sprites/SpriteGridTiles'
import SpriteStatic from 'components/_DeFiKingdoms/_helpers/sprites/SpriteStatic'
import { getSceneConfig } from 'features/zones/utils'
import styled from 'styled-components'
import clickCursor from 'assets/images/gui/click-cursor-2x.png'
import aoislaNpc from '../images/aoisla-sheet.png'
import background from '../images/background.png'
import bison1 from '../images/bison1.png'
import bison2 from '../images/bison2.png'
import chicken from '../images/chicken-sheet.png'
import cratebunny from '../images/cratebunny-sheet.png'
import crierNpc from '../images/crier-sheet.png'
import dog from '../images/dog-sheet.png'
import overlay from '../images/doodads-sheet.png'
import druidNpc from '../images/druid-sheet.png'
import flamesBlue from '../images/flames-blue.png'
import flamesGreen from '../images/flames-green.png'
import flamesOrange from '../images/flames-orange.png'
import flamesPink from '../images/flames-pink.png'
import flamesPurple from '../images/flames-purple.png'
import flamesTeal from '../images/flames-teal.png'
import flamesYellow from '../images/flames-yellow.png'
import hunterNpc from '../images/hunter-sheet.png'
import borderImage from '../images/map-border-box.png'
import olgaNpc from '../images/olga-sheet.png'
import sign from '../images/sign-sheet.png'
import stylistNpc from '../images/stylist-sheet.png'
import traderNpc from '../images/trader-sheet.png'
import vendorNpc from '../images/vendor-sheet.png'
import vithravenSign from '../images/vithraven-sign.gif'

interface MarketplaceProps {
  width: number
  height: number
  showSwapModal: boolean
  setShowSwapModal: any
  showPoolModal: boolean
  setShowPoolModal: any
  showVendorModal: boolean
  setShowVendorModal: any
  showCrierModal: boolean
  setShowCrierModal: any
  showStylistModal: boolean
  setShowStylistModal: any
  showAoislaModal: boolean
  setShowAoislaModal: Function
  showHunterModal: boolean
  setShowHunterModal: Function
  showOlgaModal: boolean
  setShowOlgaModal: Function
  setShowSignModal: Function
}

const { bgWidth, bgHeight, differenceRatio, frameWidth, frameHeight, frameThickness } = getSceneConfig([960, 640], 20)

const getFlames = () => {
  const date = new Date()

  switch (date.getDay()) {
    case 1: // Monday
      return flamesGreen
    case 2: // Tuesday
      return flamesPink
    case 3: // Wednesday
      return flamesPurple
    case 4: // Thursday
      return flamesOrange
    case 5: // Friday
      return flamesTeal
    case 6: // Saturday
      return flamesYellow
  }

  return flamesBlue // Sunday
}

const MarketplaceScene: React.FC<MarketplaceProps> = ({
  setShowSwapModal,
  setShowPoolModal,
  setShowVendorModal,
  setShowCrierModal,
  setShowStylistModal,
  setShowAoislaModal,
  setShowHunterModal,
  setShowOlgaModal,
  setShowSignModal
}: MarketplaceProps) => {
  const handleTraderClick = () => {
    setShowSwapModal(true)
  }

  const handleDruidClick = () => {
    setShowPoolModal(true)
  }

  const handleVendorClick = () => {
    setShowVendorModal(true)
  }

  const handleCrierClick = () => {
    setShowCrierModal(true)
  }

  const handleStylistClick = () => {
    setShowStylistModal(true)
  }

  const handleAoislaClick = () => {
    setShowAoislaModal(true)
  }

  const handleHunterClick = () => {
    setShowHunterModal(true)
  }

  const handleOlgaClick = () => {
    setShowOlgaModal(true)
  }

  const handleVithravenSignClick = () => {
    setShowSignModal(true)
  }

  const handleDogClick = () => {
    Events.dispatch('dog', {
      state: 1
    })

    const delay = setTimeout(() => {
      Events.dispatch('dog', {
        state: 0
      })
    }, 1000)

    return () => clearTimeout(delay)
  }

  const handleChickenClick = () => {
    Events.dispatch('chicken', {
      state: 1
    })

    const delay = setTimeout(() => {
      Events.dispatch('chicken', {
        state: 0
      })
    }, 1000)

    return () => clearTimeout(delay)
  }

  const handleSignClick = () => {
    Events.dispatch('sign', {
      state: 1
    })

    const delay = setTimeout(() => {
      Events.dispatch('sign', {
        state: 0
      })
    }, 1200)

    return () => clearTimeout(delay)
  }

  const handleCrateClick1 = () => {
    Events.dispatch('crate1', {
      state: 1
    })

    const delay = setTimeout(() => {
      Events.dispatch('crate1', {
        state: 0
      })
    }, 1200)

    return () => clearTimeout(delay)
  }

  const handleCrateClick2 = () => {
    Events.dispatch('crate2', {
      state: 1
    })

    const delay = setTimeout(() => {
      Events.dispatch('crate2', {
        state: 0
      })
    }, 1200)

    return () => clearTimeout(delay)
  }

  const handleCrateClick3 = () => {
    Events.dispatch('crate3', {
      state: 1
    })

    const delay = setTimeout(() => {
      Events.dispatch('crate3', {
        state: 0
      })
    }, 1200)

    return () => clearTimeout(delay)
  }

  return (
    <MarketplaceContainer>
      <GridTiles visible={false} diffRatio={differenceRatio} gridSize={64} />
      <BorderImage>
        <SpriteDynamic
          diffRatio={differenceRatio}
          spriteSheet={borderImage}
          sheetSize={[frameWidth, frameHeight]}
          frameSize={[frameWidth, frameHeight]}
          frameStarts={[0]}
          frameCounts={[1]}
          animationSpeeds={[1]}
          position={[0, 0]}
          spriteOffset={[frameThickness / 2, frameThickness / 2]}
        />
      </BorderImage>
      <SpriteDynamic
        spriteSheet={overlay}
        diffRatio={differenceRatio}
        sheetSize={[7680, 640]}
        frameSize={[960, 640]}
        frameStarts={[0]}
        frameCounts={[8]}
        animationSpeeds={[1]}
        position={[0, 0]}
        zOffset={1}
      />
      <SpriteDynamic
        spriteSheet={getFlames()}
        diffRatio={differenceRatio}
        sheetSize={[1536, 256]}
        frameSize={[192, 256]}
        frameStarts={[0]}
        frameCounts={[8]}
        animationSpeeds={[1]}
        position={[24, 10]}
        spriteOffset={[0, 1]}
        zOffset={1}
      />
      <SpriteDynamic
        spriteSheet={background}
        diffRatio={differenceRatio}
        sheetSize={[960, 640]}
        frameSize={[960, 640]}
        frameStarts={[0]}
        frameCounts={[1]}
        animationSpeeds={[2]}
        position={[0, 0]}
      />
      <MarketplaceElements>
        <SpriteDynamic
          diffRatio={differenceRatio}
          spriteSheet={traderNpc}
          sheetSize={[880, 43]}
          frameSize={[55, 43]}
          frameStarts={[4, 5, 6]}
          frameCounts={[1, 1, 4]}
          animationSpeeds={[4, 0.25, 4]}
          position={[37, 24]}
          autoCycle={true}
        />
        <SpriteDynamic
          diffRatio={differenceRatio}
          spriteSheet={druidNpc}
          sheetSize={[686, 48]}
          frameSize={[49, 48]}
          frameStarts={[0, 1, 2, 3]}
          frameCounts={[1, 1, 1, 10]}
          animationSpeeds={[4, 0.25, 4.25, 6]}
          position={[24, 28]}
          spriteOffset={[-4, -4]}
          autoCycle={true}
        />
        <SpriteDynamic
          diffRatio={differenceRatio}
          spriteSheet={vendorNpc}
          sheetSize={[4368, 54]}
          frameSize={[48, 54]}
          frameStarts={[4, 5, 6, 10]}
          frameCounts={[1, 1, 4, 80]}
          animationSpeeds={[5, 0.25, 4.6, 8.6]}
          position={[37, 10]}
          spriteOffset={[0, 4]}
          autoCycle={true}
        />
        <SpriteDynamic
          diffRatio={differenceRatio}
          spriteSheet={crierNpc}
          sheetSize={[2240, 54]}
          frameSize={[64, 54]}
          frameStarts={[0, 1, 2, 6]}
          frameCounts={[1, 1, 4, 28]}
          animationSpeeds={[4.25, 0.25, 4.1, 1.4]}
          position={[24, 9]}
          spriteOffset={[-6, -10]}
          autoCycle={true}
        />
        <SpriteDynamic
          diffRatio={differenceRatio}
          spriteSheet={stylistNpc}
          sheetSize={[1610, 47]}
          frameSize={[35, 47]}
          frameStarts={[4, 5, 6, 16, 20, 41]}
          frameCounts={[1, 1, 4, 4, 20, 5]}
          animationSpeeds={[5, 0.25, 4, 4, 1, 5]}
          position={[17, 21]}
          spriteOffset={[0, 0]}
          autoCycle={true}
        />
        <SpriteDynamic
          diffRatio={differenceRatio}
          spriteSheet={bison1}
          sheetSize={[640, 64]}
          frameSize={[80, 64]}
          frameStarts={[0]}
          frameCounts={[8]}
          animationSpeeds={[2]}
          position={[11, 5]}
        />
        <SpriteDynamic
          diffRatio={differenceRatio}
          spriteSheet={bison2}
          sheetSize={[768, 64]}
          frameSize={[96, 64]}
          frameStarts={[0]}
          frameCounts={[8]}
          animationSpeeds={[1.25]}
          position={[15, 4]}
        />
        <SpriteDynamic
          diffRatio={differenceRatio}
          spriteSheet={dog}
          sheetSize={[1152, 48]}
          frameSize={[64, 48]}
          frameStarts={[0, 8]}
          frameCounts={[8, 10]}
          animationSpeeds={[1.5, 1]}
          position={[13, 23]}
          event={'dog'}
        />
        <SpriteDynamic
          diffRatio={differenceRatio}
          spriteSheet={chicken}
          sheetSize={[864, 64]}
          frameSize={[48, 64]}
          frameStarts={[0, 8]}
          frameCounts={[8, 10]}
          animationSpeeds={[2, 1]}
          position={[43, 20]}
          event={'chicken'}
        />
        <SpriteDynamic
          diffRatio={differenceRatio}
          spriteSheet={sign}
          sheetSize={[720, 60]}
          frameSize={[60, 60]}
          frameStarts={[0, 0]}
          frameCounts={[1, 12]}
          animationSpeeds={[2, 1.2]}
          position={[50, 9]}
          event={'sign'}
        />
        <SpriteDynamic
          diffRatio={differenceRatio}
          spriteSheet={cratebunny}
          sheetSize={[720, 60]}
          frameSize={[60, 60]}
          frameStarts={[0, 0]}
          frameCounts={[1, 12]}
          animationSpeeds={[2, 1.2]}
          position={[23, 6]}
          event={'crate1'}
        />
        <SpriteDynamic
          diffRatio={differenceRatio}
          spriteSheet={cratebunny}
          sheetSize={[720, 60]}
          frameSize={[60, 60]}
          frameStarts={[0, 0]}
          frameCounts={[1, 12]}
          animationSpeeds={[2, 1.2]}
          position={[1, 10]}
          event={'crate2'}
          spriteOffset={[-4, 5]}
        />
        <SpriteDynamic
          diffRatio={differenceRatio}
          spriteSheet={cratebunny}
          sheetSize={[720, 60]}
          frameSize={[60, 60]}
          frameStarts={[0, 0]}
          frameCounts={[1, 12]}
          animationSpeeds={[2, 1.2]}
          position={[20, 34]}
          event={'crate3'}
          spriteOffset={[-5, 6]}
        />
        <SpriteDynamic
          diffRatio={differenceRatio}
          spriteSheet={aoislaNpc}
          sheetSize={[376, 51]}
          frameSize={[47, 51]}
          frameStarts={[0, 0, 0, 1]}
          frameCounts={[2, 2, 2, 7]}
          animationSpeeds={[2, 2, 2, 1]}
          position={[48, 17]}
          autoCycle={true}
        />
        <SpriteDynamic
          diffRatio={differenceRatio}
          spriteSheet={hunterNpc}
          sheetSize={[448, 50]}
          frameSize={[56, 50]}
          frameStarts={[0, 1, 5, 6, 7]}
          frameCounts={[2, 5, 1, 1, 1]}
          animationSpeeds={[3, 2, 3, 0.25, 2]}
          position={[35, 36]}
          spriteOffset={[-4, 0]}
          autoCycle={true}
        />
        <SpriteDynamic
          diffRatio={differenceRatio}
          spriteSheet={olgaNpc}
          sheetSize={[270, 58]}
          frameSize={[45, 58]}
          frameStarts={[0, 1, 5]}
          frameCounts={[1, 4, 1]}
          animationSpeeds={[4, 4, 0.25]}
          position={[23, 3]}
          spriteOffset={[-4, 6]}
          autoCycle={true}
        />
        <SpriteStatic
          diffRatio={differenceRatio}
          sprite={vithravenSign}
          frameSize={[80, 80]}
          position={[19, 8]}
          spriteOffset={[0, 0]}
        />

        <SpriteBubble
          positioning={{ top: 430, left: 414 }}
          onClick={handleDruidClick}
          diffRatio={differenceRatio}
          text="Druid"
        />
        <DruidClickBox onClick={handleDruidClick} />
        <SpriteBubble
          positioning={{ top: 360, left: 620 }}
          onClick={handleTraderClick}
          diffRatio={differenceRatio}
          text="Trader"
        />
        <TraderClickBox onClick={handleTraderClick} />
        <SpriteBubble
          positioning={{ top: 140, left: 616 }}
          onClick={handleVendorClick}
          diffRatio={differenceRatio}
          text={'Vendor'}
        />
        <VendorClickBox onClick={handleVendorClick} />
        <CrierClickBox onClick={handleCrierClick} />
        <StylistClickBox onClick={handleStylistClick} />
        <DogClickBox onClick={handleDogClick} />
        <ChickenClickBox onClick={handleChickenClick} />
        <SignClickBox onClick={handleSignClick} />
        <VithravenSignClickbox onClick={handleVithravenSignClick} />
        <CrateClickBox1 onClick={handleCrateClick1} />
        <CrateClickBox2 onClick={handleCrateClick2} />
        <CrateClickBox3 onClick={handleCrateClick3} />
        <AoislaClickBox onClick={handleAoislaClick} />
        <HunterClickBox onClick={handleHunterClick} />
        <OlgaClickBox onClick={handleOlgaClick} />
      </MarketplaceElements>
    </MarketplaceContainer>
  )
}

export default memo(MarketplaceScene)

const MarketplaceContainer = memo(
  styled.div.attrs(() => ({
    className: 'marketplace-container'
  }))`
    position: relative;
    width: ${bgWidth}px;
    height: ${bgHeight}px;
    padding: 0;
    margin: 0;
    overflow: visible;
  `,
  (prevProps, nextProps) => true
)

const MarketplaceElements = memo(
  styled.div.attrs(() => ({
    className: 'marketplace-elements'
  }))`
    position: relative;
    width: ${bgWidth}px;
    height: ${bgHeight}px;
    padding: 0;
    margin: 0;
    overflow: hidden;
    z-index: 1000;
  `,
  (prevProps, nextProps) => true
)

const BorderImage = memo(
  styled.div.attrs(props => ({
    className: 'border-image'
  }))`
    position: absolute;
    overflow: visible;
    z-index: 260;
  `,
  (prevProps, nextProps) => true
)

const TraderClickBox = styled.div.attrs(props => ({
  className: 'trader-clickbox'
}))`
  width: ${40 * differenceRatio[0]}px;
  height: ${40 * differenceRatio[1]}px;
  position: absolute;
  left: ${600 * differenceRatio[0]}px;
  top: ${385 * differenceRatio[1]}px;
  overflow: hidden;
  cursor: url(${clickCursor}), auto;
  z-index: 5000;
`

const DruidClickBox = styled.div.attrs(props => ({
  className: 'druid-clickbox'
}))`
  width: ${40 * differenceRatio[0]}px;
  height: ${40 * differenceRatio[1]}px;
  position: absolute;
  left: ${394 * differenceRatio[0]}px;
  top: ${458 * differenceRatio[1]}px;
  overflow: hidden;
  cursor: url(${clickCursor}), auto;
  z-index: 5000;
`

const VendorClickBox = styled.div.attrs(props => ({
  className: 'vendor-clickbox'
}))`
  width: ${40 * differenceRatio[0]}px;
  height: ${40 * differenceRatio[1]}px;
  position: absolute;
  left: ${598 * differenceRatio[0]}px;
  top: ${165 * differenceRatio[1]}px;
  overflow: hidden;
  cursor: url(${clickCursor}), auto;
  z-index: 5000;
`

const CrierClickBox = styled.button.attrs(props => ({
  className: 'crier-clickbox'
}))`
  width: ${40 * differenceRatio[0]}px;
  height: ${40 * differenceRatio[1]}px;
  position: absolute;
  left: ${395 * differenceRatio[0]}px;
  top: ${164 * differenceRatio[1]}px;
  overflow: hidden;
  cursor: url(${clickCursor}), auto;
  outline: 0;
  border: 0;
  padding: 0;
  background-color: transparent;
  z-index: 5000;
`

const StylistClickBox = styled.button.attrs(props => ({
  className: 'stylist-clickbox'
}))`
  width: ${40 * differenceRatio[0]}px;
  height: ${40 * differenceRatio[1]}px;
  position: absolute;
  left: ${275 * differenceRatio[0]}px;
  top: ${342 * differenceRatio[1]}px;
  overflow: hidden;
  cursor: url(${clickCursor}), auto;
  outline: 0;
  border: 0;
  padding: 0;
  background-color: transparent;
  z-index: 5000;
`

const DogClickBox = styled.div.attrs(props => ({
  className: 'dog-clickbox'
}))`
  width: ${10 * differenceRatio[0]}px;
  height: ${10 * differenceRatio[1]}px;
  position: absolute;
  left: ${236 * differenceRatio[0]}px;
  top: ${395 * differenceRatio[1]}px;
  overflow: hidden;
  cursor: url(${clickCursor}), auto;
  z-index: 5000;
`

const ChickenClickBox = styled.div.attrs(props => ({
  className: 'chicken-clickbox'
}))`
  width: ${10 * differenceRatio[0]}px;
  height: ${10 * differenceRatio[1]}px;
  position: absolute;
  left: ${710 * differenceRatio[0]}px;
  top: ${350 * differenceRatio[1]}px;
  overflow: hidden;
  cursor: url(${clickCursor}), auto;
  z-index: 5000;
`

const SignClickBox = styled.button.attrs(props => ({
  className: 'sign-clickbox'
}))`
  width: ${18 * differenceRatio[0]}px;
  height: ${18 * differenceRatio[1]}px;
  position: absolute;
  left: ${821 * differenceRatio[0]}px;
  top: ${170 * differenceRatio[1]}px;
  overflow: hidden;
  outline: 0;
  border: 0;
  padding: 0;
  background-color: transparent;
  cursor: url(${clickCursor}), auto;
  z-index: 5000;
`

const VithravenSignClickbox = styled.button.attrs(props => ({
  className: 'sign-clickbox'
}))`
  width: ${75 * differenceRatio[0]}px;
  height: ${65 * differenceRatio[1]}px;
  position: absolute;
  left: ${305 * differenceRatio[0]}px;
  top: ${140 * differenceRatio[1]}px;
  overflow: hidden;
  outline: 0;
  border: 0;
  padding: 0;
  background-color: transparent;
  cursor: url(${clickCursor}), auto;
  z-index: 5000;
`

const CrateClickBox1 = styled.div.attrs(props => ({
  className: 'crate1-clickbox'
}))`
  width: ${10 * differenceRatio[0]}px;
  height: ${10 * differenceRatio[1]}px;
  position: absolute;
  left: ${387 * differenceRatio[0]}px;
  top: ${125 * differenceRatio[1]}px;
  overflow: hidden;
  cursor: url(${clickCursor}), auto;
  z-index: 5000;
`

const CrateClickBox2 = styled.div.attrs(props => ({
  className: 'crate2-clickbox'
}))`
  width: ${10 * differenceRatio[0]}px;
  height: ${10 * differenceRatio[1]}px;
  position: absolute;
  left: ${40 * differenceRatio[0]}px;
  top: ${185 * differenceRatio[1]}px;
  overflow: hidden;
  cursor: url(${clickCursor}), auto;
  z-index: 5000;
`

const CrateClickBox3 = styled.div.attrs(props => ({
  className: 'crate3-clickbox'
}))`
  width: ${10 * differenceRatio[0]}px;
  height: ${10 * differenceRatio[1]}px;
  position: absolute;
  left: ${345 * differenceRatio[0]}px;
  top: ${570 * differenceRatio[1]}px;
  overflow: hidden;
  cursor: url(${clickCursor}), auto;
  z-index: 5000;
`

const AoislaClickBox = styled.div.attrs(props => ({
  className: 'aoisla-clickbox'
}))`
  width: ${48 * differenceRatio[0]}px;
  height: ${60 * differenceRatio[1]}px;
  position: absolute;
  left: ${765 * differenceRatio[0]}px;
  top: ${270 * differenceRatio[1]}px;
  overflow: hidden;
  cursor: url(${clickCursor}), auto;
  z-index: 5000;
`

const HunterClickBox = styled.div.attrs(props => ({
  className: 'hunter-clickbox'
}))`
  width: ${48 * differenceRatio[0]}px;
  height: ${60 * differenceRatio[1]}px;
  position: absolute;
  left: ${570 * differenceRatio[0]}px;
  top: ${570 * differenceRatio[1]}px;
  overflow: hidden;
  cursor: url(${clickCursor}), auto;
  z-index: 5000;
`

const OlgaClickBox = styled.button.attrs(props => ({
  className: 'olga-clickbox'
}))`
  width: ${48 * differenceRatio[0]}px;
  height: ${60 * differenceRatio[1]}px;
  position: absolute;
  left: ${370 * differenceRatio[0]}px;
  top: ${45 * differenceRatio[1]}px;
  overflow: hidden;
  cursor: url(${clickCursor}), auto;
  outline: 0;
  border: 0;
  padding: 0;
  background-color: transparent;
  z-index: 5000;
`
