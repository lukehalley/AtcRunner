import { useState, useRef } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import DruidPoolModal from 'components/DruidPoolModal'
import TraderSwapModal from 'components/TraderSwapModal'
import FooterMenu from 'components/_DeFiKingdoms/FooterMenu'
import NPCSimpleModal from 'components/_DeFiKingdoms/NPCSimpleModal'
import { getWindowSizeAndRatio } from 'features/zones/utils'
import useElementSize from 'hooks/useElementSize'
import MarketplaceScene from './scene'

export default function Marketplace() {
  const MarketplaceRef = useRef(null)
  const { width, height } = useElementSize(MarketplaceRef)
  const { smallWindow, widthRatio } = getWindowSizeAndRatio()

  const [showSwapModal, setShowSwapModal] = useState(false)
  const [showPoolModal, setShowPoolModal] = useState(false)
  const [showVendorModal, setShowVendorModal] = useState(false)
  const [showCrierModal, setShowCrierModal] = useState(false)
  const [showStylistModal, setShowStylistModal] = useState(false)
  const [showAoislaModal, setShowAoislaModal] = useState(false)
  const [showHunterModal, setShowHunterModal] = useState(false)
  const [showOlgaModal, setShowOlgaModal] = useState(false)
  const [showSignModal, setShowSignModal] = useState(false)

  return (
    <>
      <div
        className="marketplace-scene"
        ref={MarketplaceRef}
        style={{ position: 'relative', width: '100vw', zIndex: 1 }}
      >
        <TransformWrapper
          alignmentAnimation={{
            sizeX: 960,
            sizeY: 640,
            velocityAlignmentTime: 1000,
            animationTime: 1000
          }}
          panning={{
            excluded: ['trader-clickbox', 'druid-clickbox', 'zada-clickbox', 'crier-clickbox', 'text-bubble']
          }}
          initialScale={smallWindow ? 1.8 : widthRatio}
          maxScale={smallWindow ? 2.5 : widthRatio * 1.5}
          minScale={smallWindow ? 1 : widthRatio * 0.6}
          limitToBounds
          centerOnInit
        >
          <TransformComponent wrapperStyle={{ height: '100vh', width: '100vw' }}>
            {width && height && (
              <MarketplaceScene
                width={width}
                height={height}
                showSwapModal={showSwapModal}
                setShowSwapModal={setShowSwapModal}
                showPoolModal={showPoolModal}
                setShowPoolModal={setShowPoolModal}
                showVendorModal={showVendorModal}
                setShowVendorModal={setShowVendorModal}
                showCrierModal={showCrierModal}
                setShowCrierModal={setShowCrierModal}
                showStylistModal={showStylistModal}
                setShowStylistModal={setShowStylistModal}
                showAoislaModal={showAoislaModal}
                setShowAoislaModal={setShowAoislaModal}
                showHunterModal={showHunterModal}
                setShowHunterModal={setShowHunterModal}
                showOlgaModal={showOlgaModal}
                setShowOlgaModal={setShowOlgaModal}
                setShowSignModal={setShowSignModal}
              />
            )}
          </TransformComponent>
        </TransformWrapper>
      </div>

      <TraderSwapModal
        npcName="Ragna"
        npcText="Hail, traveler! I can help you trade tokens. Just let me know what you need."
        setShowSwapModal={setShowSwapModal}
        showSwapModal={showSwapModal}
      />
      <DruidPoolModal
        npcName="Druid Ulfur"
        npcText="Seeds are what you seek? I would be honored to assist you. You can merge tokens to create new seeds, or my magic can split your existing seeds into their original parts. Once you're ready, go to the Gardens and deposit them. Then, you will be able to start harvesting rewards."
        setShowPoolModal={setShowPoolModal}
        showPoolModal={showPoolModal}
      />
      <NPCSimpleModal
        showModal={showSignModal}
        dismissModal={() => setShowSignModal(false)}
        npcName="Vithraven Town Sign"
        description="<strong>Welcome to Vithraven</strong><br/>Founded by the Tribes of Fehlijur under Skali's Blessing<br/><br/>Population 8,000"
      />
      <NPCSimpleModal
        showModal={showCrierModal}
        dismissModal={() => setShowCrierModal(false)}
        npcName="Town Crier Angelo"
        description="We've had a bit of trouble with the printing press this morning. But come back soon and we'll give you the latest on Crystalvale!"
      />
      <NPCSimpleModal
        showModal={showVendorModal}
        dismissModal={() => setShowVendorModal(false)}
        npcName="Vendor Eevi"
        description="A blessed day, Hero! If you're looking to buy the essentials, you've come to the right place! Thanks to Skali's blessing, I've finally been able to start my own business. I'll be setting up shop shortly, so please come back again later. "
      />
      <NPCSimpleModal
        showModal={showAoislaModal}
        dismissModal={() => setShowAoislaModal(false)}
        npcName="Aoisla, Swift Feet"
        description="I took the time to set up the goals, but neither team are here yet! We can't play a game without players. Hopefully they'll show up soon, or else I'm packing up."
      />
      <NPCSimpleModal
        showModal={showHunterModal}
        dismissModal={() => setShowHunterModal(false)}
        npcName="Hunter Fior"
        description="Our hunters just returned with the haul of a lifetime! Vithraven will be eating good this week. Want to try your hand at hunting? Check back in when we're about to set out."
      />
      <NPCSimpleModal
        showModal={showOlgaModal}
        dismissModal={() => setShowOlgaModal(false)}
        npcName="Olga"
        description="Welcome, Hero! Vithraven's bison are my pride and joy! If only they stayed put. I can rein them in when they get out, but it ruins half my day. Perhaps next time we can work together to round them up?"
      />
      <NPCSimpleModal
        showModal={showStylistModal}
        dismissModal={() => setShowStylistModal(false)}
        npcName="Stylist Brina"
        description="I can do more than trim your bangs. A cut here...a little tuck there...and you'll look like a new person. But first I'll just need you to waive me of all liability..."
      />
      <FooterMenu />
    </>
  )
}
