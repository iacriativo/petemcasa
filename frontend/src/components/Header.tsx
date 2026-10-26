import { PawHouseIcon } from './icons'
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="header">
      <div className="header__row">
        <span className="header__badge">
          <PawHouseIcon className="header__logo-icon" />
        </span>
        <Link to="/" className="header__logo">
          PET
          <small>EM CASA</small>
        </Link>
      </div>
    </header>
  )
}