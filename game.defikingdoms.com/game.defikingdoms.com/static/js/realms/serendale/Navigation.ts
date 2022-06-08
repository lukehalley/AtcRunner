import { dispatch } from 'features'
import { setShowHeroBridgeModal } from 'features/bridge/state'

export const serendaleNavigation = [
  { label: 'Alchemist', path: '/alchemist' },
  { label: 'Bridge Tokens', path: '/bridge' },
  {
    label: 'Bridge Heroes / Tears',
    path: '/docks',
    onClick: () => dispatch(setShowHeroBridgeModal(true)),
    hideActiveState: true
  },
  { label: 'Castle', path: '/castle' },
  { label: 'Docks', path: '/docks' },
  { label: 'Gardens', path: '/gardens' },
  { label: 'Jeweler', path: '/jeweler' },
  {
    label: 'Marketplace',
    path: '',
    subroutes: [
      { label: 'Central Marketplace', path: '/marketplace/central' },
      { label: 'East Marketplace', path: '/marketplace/east' }
    ]
  },
  { label: 'Meditation Circle', path: '/meditation' },
  { label: 'Portal', path: '/portal' },
  { label: 'Professions', path: '/professions' },
  { label: 'Tavern', path: '/tavern' }
]
