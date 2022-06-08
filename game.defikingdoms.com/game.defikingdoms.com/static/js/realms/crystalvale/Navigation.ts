import { dispatch } from 'features'
import { setShowHeroBridgeModal } from 'features/bridge/state'

export const crystalvaleNavigation = [
  { label: 'Bridge Tokens', path: '/bridge' },
  {
    label: 'Bridge Heroes / Tears',
    path: '/docks',
    onClick: () => dispatch(setShowHeroBridgeModal(true)),
    hideActiveState: true
  },
  { label: 'Docks', path: '/docks' },
  { label: 'Gardens', path: '/gardens' },
  { label: 'Jeweler', path: '/jeweler' },
  { label: 'Marketplace', path: '/marketplace' },
  { label: 'Meditation Circle', path: '/meditation' },
  { label: 'Portal', path: '/portal' },
  { label: 'Tavern', path: '/tavern' },
  { label: 'The Cradle', path: '/cradle' }
]
