import Header from './Header'
import Hero from './Hero'
import Benefits from './Benefits'
import Search from './Search'
import Categories from './Categories'
import Banner from './Banner'
import Offers from './Offers'
import HowItWorks from './HowItWorks'
import CartBar from './CartBar'

export default function Home() {
  return (
    <main className="screen">
      <Header />
      <Hero />
      <Benefits />
      <Search />
      <Categories />
      <Banner />
      <Offers />
      <HowItWorks />
      <footer className="footer-note">Pet em Casa • entregas dentro do condomínio</footer>
      <CartBar />
    </main>
  )
}