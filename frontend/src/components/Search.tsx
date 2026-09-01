import { SearchIcon } from './icons'

export default function Search() {
  return (
    <section className="search">
      <div className="search__field">
        <SearchIcon className="search__icon" />
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