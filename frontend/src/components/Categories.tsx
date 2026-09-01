import { BowlIcon, BoneIcon, BottleIcon, BallIcon, HealthIcon, GridIcon } from './icons'

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
          <button className="cat" key={cat.name} type="button">
            <span className="cat__circle">
              <cat.icon className="cat__icon" />
            </span>
            <span className="cat__name">{cat.name}</span>
          </button>
        ))}
        <button className="cat cat--special" type="button">
          <span className="cat__circle">
            <GridIcon className="cat__icon" />
          </span>
          <span className="cat__name">Ver todas</span>
        </button>
      </div>
    </section>
  )
}