import { SearchIcon } from './icons'
import { Link } from 'react-router-dom'

export default function Search() {
  return (
    <section className="search">
      <div className="search__field">
        <Link to="/catalogo" className="search__icon-wrap">
          <SearchIcon className="search__icon" />
        </Link>
        <input
          className="search__input"
          type="search"
          placeholder="Buscar produtos para o seu pet..."
          aria-label="Buscar produtos para o seu pet"
          readOnly
        />
      </div>
    </section>
  )
}