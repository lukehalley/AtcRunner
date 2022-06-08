import { useState } from 'react'
import { NavLink } from 'react-router-dom'

type Route = {
  label: string
  path: string
  onClick?: Function
  hideActiveState?: boolean
}

export interface RouteWithSubRoutes extends Route {
  subroutes?: Route[]
}

interface RouteProps {
  route: RouteWithSubRoutes
  setMenuOpen: Function
  setShowAbout: Function
}

const activeStyle = ({ isActive }: { isActive: boolean }) => (isActive ? 'is-active' : undefined) as string

export function Route({
  route: { label, path, onClick, hideActiveState, subroutes },
  setMenuOpen,
  setShowAbout
}: RouteProps) {
  const [isSubnavOpen, setIsSubnavOpen] = useState(false)
  function toggleSubnav() {
    setIsSubnavOpen(s => !s)
  }
  function handleRouteClick(clickFn?: Function) {
    setMenuOpen(false)
    setShowAbout(false)
    if (clickFn) {
      clickFn()
    }
  }
  if (subroutes?.length) {
    return (
      <>
        <a onClick={toggleSubnav}>{isSubnavOpen ? `${label} -` : `${label} +`}</a>
        {isSubnavOpen && (
          <span className="subnav">
            {subroutes.map(s => (
              <NavLink
                key={s.label}
                className={s.hideActiveState ? undefined : activeStyle}
                to={s.path}
                onClick={() => handleRouteClick(s.onClick)}
              >
                {s.label}
              </NavLink>
            ))}
          </span>
        )}
      </>
    )
  }
  return (
    <NavLink
      key={label}
      className={hideActiveState ? undefined : activeStyle}
      to={path}
      onClick={() => handleRouteClick(onClick)}
    >
      {label}
    </NavLink>
  )
}
