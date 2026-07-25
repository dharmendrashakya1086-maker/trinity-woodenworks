import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Hammer, Leaf, Award, HeartHandshake } from 'lucide-react'

const values = [
  { icon: Hammer, title: 'Handcrafted', desc: 'Every piece is made by hand with traditional techniques' },
  { icon: Leaf, title: 'Sustainable', desc: 'Responsibly sourced wood from managed forests' },
  { icon: Award, title: 'Premium Quality', desc: 'Built to last generations with proper care' },
  { icon: HeartHandshake, title: 'Custom Orders', desc: 'We bring your unique visions to life' },
]

export default function About() {
  return (
    <div className="pt-20 pb-16">
      <section className="section-padding max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <span className="badge badge-gold mb-4 inline-block">Our Story</span>
          <h1 className="text-3xl sm:text-4xl font-bold gold-text mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Crafted with Passion
          </h1>
          <p className="text-text-muted text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Founded in Varanasi, Trinity Woodenworks began as a small workshop with a big dream: to create wooden furniture that tells a story. Each piece carries centuries of woodworking tradition, reimagined for modern living.
          </p>
        </motion.div>
      </section>

      <section className="section-padding max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass glass-hover rounded-2xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gold-dim border border-gold/10 flex items-center justify-center">
                <v.icon className="text-gold" size={20} />
              </div>
              <h3 className="text-sm font-semibold text-text mb-1">{v.title}</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section-padding max-w-4xl mx-auto text-center">
        <div className="glass rounded-3xl p-8 sm:p-10">
          <h2 className="text-xl sm:text-2xl font-bold gold-text mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Visit Our Workshop</h2>
          <p className="text-text-muted text-sm mb-5 max-w-md mx-auto">Located in Varanasi, India. Schedule a visit to see our craftsmen at work.</p>
          <Link to="/contact" className="btn-gold no-underline text-sm">Get in Touch</Link>
        </div>
      </section>
    </div>
  )
}
