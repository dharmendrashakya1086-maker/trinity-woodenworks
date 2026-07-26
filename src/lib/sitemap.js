import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'

// Generate sitemap on build or on-demand
export default function Sitemap() {
  useEffect(() => {
    async function generate() {
      const [prodSnap, catSnap, colSnap] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'collections')),
      ])

      const urls = [
        { loc: '/', priority: '1.0', changefreq: 'daily' },
        { loc: '/shop', priority: '0.9', changefreq: 'daily' },
        { loc: '/categories', priority: '0.8', changefreq: 'weekly' },
        { loc: '/about', priority: '0.6', changefreq: 'monthly' },
        { loc: '/contact', priority: '0.6', changefreq: 'monthly' },
        { loc: '/custom-order', priority: '0.7', changefreq: 'monthly' },
      ]

      catSnap.docs.forEach(d => {
        const data = d.data()
        urls.push({ loc: `/shop/${data.slug || d.id}`, priority: '0.8', changefreq: 'weekly' })
      })

      colSnap.docs.forEach(d => {
        const data = d.data()
        urls.push({ loc: `/shop/collection/${data.slug || d.id}`, priority: '0.7', changefreq: 'weekly' })
      })

      prodSnap.docs.forEach(d => {
        const data = d.data()
        if (data.slug || data.name) {
          urls.push({ loc: `/product/${data.slug || d.id}`, priority: '0.9', changefreq: 'weekly' })
        }
      })

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>https://trinitywoodenworks.com${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

      // Return as text for display or trigger download
      return xml
    }

    generate()
  }, [])

  return null
}

export async function generateSitemapXml() {
  const [prodSnap, catSnap, colSnap] = await Promise.all([
    getDocs(collection(db, 'products')),
    getDocs(collection(db, 'categories')),
    getDocs(collection(db, 'collections')),
  ])

  const urls = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/shop', priority: '0.9', changefreq: 'daily' },
    { loc: '/categories', priority: '0.8', changefreq: 'weekly' },
    { loc: '/about', priority: '0.6', changefreq: 'monthly' },
    { loc: '/contact', priority: '0.6', changefreq: 'monthly' },
  ]

  catSnap.docs.forEach(d => {
    const data = d.data()
    urls.push({ loc: `/shop/${data.slug || d.id}`, priority: '0.8', changefreq: 'weekly' })
  })

  colSnap.docs.forEach(d => {
    const data = d.data()
    urls.push({ loc: `/shop/collection/${data.slug || d.id}`, priority: '0.7', changefreq: 'weekly' })
  })

  prodSnap.docs.forEach(d => {
    const data = d.data()
    urls.push({ loc: `/product/${data.slug || d.id}`, priority: '0.9', changefreq: 'weekly' })
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>https://trinitywoodenworks.com${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`
}
