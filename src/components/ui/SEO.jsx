import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Trinity Woodenworks'
const SITE_URL = 'https://trinitywoodenworks.com'
const DEFAULT_IMAGE = '/og-default.jpg'

export function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  structuredData,
  noindex = false,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Handcrafted Wooden Furniture from Varanasi`
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL
  const ogImage = image || DEFAULT_IMAGE

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || 'Premium handcrafted wooden furniture from Varanasi. Tables, chairs, beds, sofas, and custom pieces by skilled artisans.'} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      <link rel="canonical" href={fullUrl} />

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  )
}

// ─── Structured Data Generators ──────────────────────────────────

export function productSchema(product) {
  if (!product?.name) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.shortDescription,
    image: product.images?.[0] || product.image,
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.brand || 'Trinity Woodenworks' },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: (product.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/product/${product.slug || product.id}`,
    },
    material: product.materials,
    dimensions: product.dimensions,
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 1,
    } : undefined,
  }
}

export function categorySchema(category) {
  if (!category?.name) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description,
    image: category.image,
    url: `${SITE_URL}/shop/${category.id}`,
  }
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Trinity Woodenworks',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Premium handcrafted wooden furniture from Varanasi, India',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Varanasi',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
    },
    sameAs: [],
  }
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url ? `${SITE_URL}${item.url}` : undefined,
    })),
  }
}
