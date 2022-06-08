import { Suspense } from 'react'
import JewelLoader from './_DeFiKingdoms/JewelLoader'

export const SuspenseWrapper = ({ children }: { children: JSX.Element }) => (
  <Suspense fallback={<JewelLoader />}>{children}</Suspense>
)
