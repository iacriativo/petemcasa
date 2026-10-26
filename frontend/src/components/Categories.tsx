import { BowlIcon, BoneIcon, BottleIcon, BallIcon, HealthIcon, GridIcon } from './icons'
import { Link } from 'react-router-dom'

const categories = [
  { icon: BowlIcon, name: 'Rações' },
  { icon: BoneIcon, name: 'Petiscos' },
  { icon: BottleIcon, name: 'Higiene' },
  { icon: BallIcon, name: 'Brinquedos' },
  { icon: HealthIcon, name: 'Saúde' },
]

export default function Categories() {
  return (
    <section className="categories">
      <div className="section__head">
        <h2 className="section__title">Categorias</h2>
      </div>
      <div className="cats__scroll">
        {categories.map((cat) => (
          <Link to="/catalogo" key={cat.name} className="cat">
            <span className="cat__circle">
              <cat.icon className="cat__icon" />
            </span>
            <span className="cat__name">{cat.name}</span>
          </Link>
        ))}
        <Link to="/catalogo" className="cat cat--special">
          <span className="cat__circle">
            <GridIcon className="cat__icon" />
          </span>
          <span className="cat__name">Ver todas</span>
        </Link>
      </div>
    </section>
  )
}