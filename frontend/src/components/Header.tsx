import { PawHouseIcon } from './icons'

export default function Header() {
  return (
    <header className="header">
      <div className="header__row">
        <span className="header__badge">
          <PawHouseIcon className="header__logo-icon" />
        </span>
        <div className="header__logo">
          PET
          <small>EM CASA</small>
        </div>
      </div>
    </header>
  )
}