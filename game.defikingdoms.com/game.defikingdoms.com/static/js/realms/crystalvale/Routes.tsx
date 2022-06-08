import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

const AddLiquidity = lazy(() => import('scenes/AddLiquidity'))
const Cradle = lazy(() => import('./scenes/cradle'))
const Docks = lazy(() => import('./scenes/docks'))
const EarnArchived = lazy(() => import('scenes/Gardens/Archived'))
const Gardens = lazy(() => import('./scenes/gardens'))
const Jeweler = lazy(() => import('./scenes/jeweler'))
const Manage = lazy(() => import('scenes/Gardens/Manage'))
const Marketplace = lazy(() => import('./scenes/marketplace'))
const Meditation = lazy(() => import('./scenes/meditation'))
const Portal = lazy(() => import('./scenes/portal'))
const Tavern = lazy(() => import('./scenes/tavern'))
const MigrateV1 = lazy(() => import('scenes/MigrateV1'))
const MigrateV1Exchange = lazy(() => import('scenes/MigrateV1/MigrateV1Exchange'))
const OpenClaimAddressModalAndRedirectToSwap = lazy(
  () => import('scenes/Marketplace/OpenClaimAddressModalAndRedirectToSwap')
)
const OverworldMap = lazy(() => import('./scenes/map'))
const PoolFinder = lazy(() => import('scenes/PoolFinder'))
const RedirectDuplicateTokenIds = lazy(() => import('scenes/AddLiquidity/RedirectDuplicateTokenIds'))
const RedirectOldAddLiquidityPathStructure = lazy(
  () => import('scenes/AddLiquidity/RedirectOldAddLiquidityPathStructure')
)
const RedirectOldRemoveLiquidityPathStructure = lazy(() => import('scenes/RemoveLiquidity/redirects'))
const RedirectPathToSwapOnly = lazy(() => import('scenes/Marketplace/RedirectPathToSwapOnly'))
const RedirectToSwap = lazy(() => import('scenes/Marketplace/RedirectToSwap'))
const RemoveLiquidity = lazy(() => import('scenes/RemoveLiquidity'))
const RemoveV1Exchange = lazy(() => import('scenes/MigrateV1/RemoveV1Exchange'))
const SynapseBridge = lazy(() => import('scenes/SynapseBridge'))

export function CrystalvaleRoutes() {
  return (
    <Routes>
      <Route index element={<OverworldMap />} />
      <Route path="cradle" element={<Cradle />} />
      <Route path="jeweler" element={<Jeweler />} />
      <Route path="bridge" element={<SynapseBridge />} />
      <Route path="docks" element={<Docks />} />
      <Route path="gardens" element={<Gardens />} />
      <Route path="marketplace" element={<Marketplace />} />
      <Route path="meditation" element={<Meditation />} />
      <Route path="tavern" element={<Tavern />} />
      <Route path="portal" element={<Portal />} />
      <Route path="add" element={<AddLiquidity />} />
      <Route path="add/:currencyIdA" element={<RedirectOldAddLiquidityPathStructure />} />
      <Route path="add/:currencyIdA/:currencyIdB" element={<RedirectDuplicateTokenIds />} />
      <Route path="staking/archived" element={<EarnArchived />} />
      <Route path="staking/:currencyIdA/:currencyIdB" element={<Manage />} />
      <Route path="create" element={<AddLiquidity />} />
      <Route path="create/:currencyIdA" element={<RedirectOldAddLiquidityPathStructure />} />
      <Route path="create/:currencyIdA/:currencyIdB" element={<RedirectDuplicateTokenIds />} />
      <Route path="remove/v1/:address" element={<RemoveV1Exchange />} />
      <Route path="remove/:tokens" element={<RedirectOldRemoveLiquidityPathStructure />} />
      <Route path="remove/:currencyIdA/:currencyIdB" element={<RemoveLiquidity />} />
      <Route path="migrate/v1" element={<MigrateV1 />} />
      <Route path="migrate/v1/:address" element={<MigrateV1Exchange />} />
      <Route path="marketplace/:outputCurrency" element={<RedirectToSwap />} />
      <Route path="claim" element={<OpenClaimAddressModalAndRedirectToSwap />} />
      <Route path="send" element={<RedirectPathToSwapOnly />} />
      <Route path="find" element={<PoolFinder />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
