import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit as fsLimit, startAfter, writeBatch,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'

// ─── Entity Statuses ────────────────────────────────────────────
export const STATUSES = {
  DRAFT: 'draft',
  IN_REVIEW: 'in_review',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
}

export const STATUS_FLOW = {
  [STATUSES.DRAFT]: [STATUSES.IN_REVIEW, STATUSES.ARCHIVED],
  [STATUSES.IN_REVIEW]: [STATUSES.DRAFT, STATUSES.SCHEDULED, STATUSES.PUBLISHED],
  [STATUSES.SCHEDULED]: [STATUSES.PUBLISHED, STATUSES.DRAFT],
  [STATUSES.PUBLISHED]: [STATUSES.ARCHIVED, STATUSES.DRAFT],
  [STATUSES.ARCHIVED]: [STATUSES.DRAFT],
}

// ─── Collection Names ───────────────────────────────────────────
export const COLLECTIONS = {
  PRODUCTS: 'products',
  PRODUCTS_DRAFT: 'products_draft',
  CATEGORIES: 'categories',
  CATEGORIES_DRAFT: 'categories_draft',
  COLLECTIONS_: 'collections',
  COLLECTIONS_DRAFT: 'collections_draft',
  ORDERS: 'orders',
  CUSTOM_ORDERS: 'customOrders',
  CARTS: 'carts',
  CUSTOMERS: 'customers',
  CONTACT_MESSAGES: 'contactMessages',
  NEWSLETTER: 'newsletter',
  ADMIN: 'admin',
  AUDIT_LOG: 'audit_log',
  ENTITY_VERSIONS: 'entity_versions',
  INVENTORY: 'inventory',
  INVENTORY_LOG: 'inventory_log',
  COUPONS: 'coupons',
  CAMPAIGNS: 'campaigns',
  SETTINGS: 'settings',
  MEDIA: 'media',
  BRANDS: 'brands',
  TAGS: 'tags',
  REVIEWS: 'reviews',
  WISHLIST: 'wishlist',
  ATTRIBUTES: 'attributes',
  NOTIFICATIONS: 'notifications',
}

// ─── Base Entity Fields ─────────────────────────────────────────
export function baseEntity(overrides = {}) {
  return {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    status: STATUSES.DRAFT,
    deleted: false,
    ...overrides,
  }
}

// ─── Safe Firestore Operations ──────────────────────────────────
async function safeGet(q) {
  try { return await getDocs(q) } catch { return { docs: [], size: 0 } }
}

async function safeGetDoc(ref) {
  try { return await getDoc(ref) } catch { return { exists: () => false, data: () => null } }
}

// ─── Generic CRUD ───────────────────────────────────────────────
export async function createEntity(collectionName, id, data) {
  const entity = baseEntity(data)
  await setDoc(doc(db, collectionName, id), entity)
  return { id, ...entity }
}

export async function updateEntity(collectionName, id, data) {
  const updates = { ...data, updatedAt: new Date().toISOString() }
  await updateDoc(doc(db, collectionName, id), updates)
  return updates
}

export async function getEntity(collectionName, id) {
  const snap = await safeGetDoc(doc(db, collectionName, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getEntities(collectionName, queries = []) {
  let q = collection(db, collectionName)
  if (queries.length) q = query(q, ...queries)
  const snap = await safeGet(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function deleteEntity(collectionName, id) {
  await deleteDoc(doc(db, collectionName, id))
}

// ─── Draft/Publish Operations ───────────────────────────────────
export async function saveDraft(entityType, id, data) {
  const draftCol = `${entityType}_draft`
  const existing = await getEntity(draftCol, id)
  const version = existing ? (existing.version || 0) + 1 : 1
  const entity = {
    ...data,
    id,
    version,
    status: STATUSES.DRAFT,
    updatedAt: new Date().toISOString(),
    createdAt: existing?.createdAt || data.createdAt || new Date().toISOString(),
  }
  await setDoc(doc(db, draftCol, id), entity)
  return entity
}

export async function publishEntity(entityType, id) {
  const draftCol = `${entityType}_draft`
  const liveCol = entityType
  const draft = await getEntity(draftCol, id)
  if (!draft) throw new Error('Draft not found')

  const published = {
    ...draft,
    status: STATUSES.PUBLISHED,
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await setDoc(doc(db, liveCol, id), published)
  return published
}

export async function publishAll(entityType) {
  const draftCol = `${entityType}_draft`
  const drafts = await getEntities(draftCol)
  const batch = writeBatch(db)
  for (const d of drafts) {
    const published = {
      ...d,
      status: STATUSES.PUBLISHED,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    batch.set(doc(db, entityType, d.id), published)
  }
  await batch.commit()
  return drafts.length
}

export async function unpublishEntity(entityType, id) {
  const liveCol = entityType
  const draftCol = `${entityType}_draft`
  const live = await getEntity(liveCol, id)
  if (!live) return

  // Move to archived in draft
  await setDoc(doc(db, draftCol, id), {
    ...live,
    status: STATUSES.ARCHIVED,
    updatedAt: new Date().toISOString(),
  })
  await deleteEntity(liveCol, id)
}

// ─── Version History ────────────────────────────────────────────
export async function saveVersion(entityType, entityId, data, userId) {
  const versionData = {
    entityType,
    entityId,
    data,
    userId,
    createdAt: new Date().toISOString(),
    version: data.version || 1,
  }
  const id = `${entityType}_${entityId}_${versionData.version}`
  await setDoc(doc(db, COLLECTIONS.ENTITY_VERSIONS, id), versionData)
  return versionData
}

export async function getVersionHistory(entityType, entityId) {
  const q = query(
    collection(db, COLLECTIONS.ENTITY_VERSIONS),
    where('entityType', '==', entityType),
    where('entityId', '==', entityId),
    orderBy('version', 'desc')
  )
  const snap = await safeGet(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function restoreVersion(entityType, entityId, version) {
  const versionId = `${entityType}_${entityId}_${version}`
  const versionSnap = await safeGetDoc(doc(db, COLLECTIONS.ENTITY_VERSIONS, versionId))
  if (!versionSnap.exists()) throw new Error('Version not found')
  const versionData = versionSnap.data()
  return saveDraft(entityType, entityId, { ...versionData.data, version: undefined })
}

// ─── Audit Log ──────────────────────────────────────────────────
export async function logAudit({ userId, action, entityType, entityId, oldValue, newValue, ip, device }) {
  const entry = {
    userId,
    action,
    entityType,
    entityId,
    oldValue: oldValue ? JSON.stringify(oldValue).slice(0, 1000) : null,
    newValue: newValue ? JSON.stringify(newValue).slice(0, 1000) : null,
    ip: ip || null,
    device: device || navigator?.userAgent?.slice(0, 200) || null,
    createdAt: new Date().toISOString(),
  }
  const id = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  await setDoc(doc(db, COLLECTIONS.AUDIT_LOG, id), entry)
  return entry
}

export async function getAuditLog(filters = {}) {
  const constraints = [orderBy('createdAt', 'desc')]
  if (filters.entityType) constraints.unshift(where('entityType', '==', filters.entityType))
  if (filters.action) constraints.unshift(where('action', '==', filters.action))
  if (filters.limit) constraints.push(fsLimit(filters.limit))
  return getEntities(COLLECTIONS.AUDIT_LOG, constraints)
}

// ─── Slug Generation ────────────────────────────────────────────
export function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ─── Merge Draft + Live for Admin ───────────────────────────────
export async function getMergedEntities(entityType) {
  const [drafts, live] = await Promise.all([
    getEntities(`${entityType}_draft`, [orderBy('createdAt', 'desc')]),
    getEntities(entityType, [orderBy('createdAt', 'desc')]),
  ])
  const allIds = new Set([...drafts.map(d => d.id), ...live.map(d => d.id)])
  return [...allIds].map(id => ({
    id,
    draft: drafts.find(d => d.id === id) || null,
    live: live.find(d => d.id === id) || null,
    name: drafts.find(d => d.id === id)?.name || live.find(d => d.id === id)?.name || '',
  }))
}

// ─── Inventory Operations ───────────────────────────────────────
export async function adjustStock(productId, variantId, qty, reason, userId) {
  const id = `${productId}_${variantId || 'main'}`
  const invRef = doc(db, COLLECTIONS.INVENTORY, id)
  const snap = await safeGetDoc(invRef)
  const current = snap.exists() ? snap.data() : { productId, variantId: variantId || null, quantity: 0, reserved: 0 }
  const newQty = Math.max(0, current.quantity + qty)
  await setDoc(invRef, { ...current, quantity: newQty, updatedAt: new Date().toISOString() })

  const logId = `inv_${Date.now()}`
  await setDoc(doc(db, COLLECTIONS.INVENTORY_LOG, logId), {
    productId, variantId: variantId || null, adjustment: qty, previousQty: current.quantity, newQty,
    reason, userId, createdAt: new Date().toISOString(),
  })
  return { ...current, quantity: newQty }
}

export async function getInventory(productId) {
  const q = query(collection(db, COLLECTIONS.INVENTORY), where('productId', '==', productId))
  const snap = await safeGet(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getAllInventory() {
  return getEntities(COLLECTIONS.INVENTORY)
}

export async function getInventoryLog(productId) {
  const q = productId
    ? query(collection(db, COLLECTIONS.INVENTORY_LOG), where('productId', '==', productId), orderBy('createdAt', 'desc'))
    : query(collection(db, COLLECTIONS.INVENTORY_LOG), orderBy('createdAt', 'desc'))
  const snap = await safeGet(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── Coupon Operations ──────────────────────────────────────────
export async function createCoupon(data) {
  const id = `coupon_${Date.now()}`
  return createEntity(COLLECTIONS.COUPONS, id, data)
}

export async function updateCoupon(id, data) {
  return updateEntity(COLLECTIONS.COUPONS, id, data)
}

export async function deleteCoupon(id) {
  return deleteEntity(COLLECTIONS.COUPONS, id)
}

export async function getCoupons() {
  return getEntities(COLLECTIONS.COUPONS)
}

export async function validateCoupon(code, cartTotal) {
  const q = query(collection(db, COLLECTIONS.COUPONS), where('code', '==', code.toUpperCase()), where('active', '==', true))
  const snap = await safeGet(q)
  if (snap.empty) return { valid: false, error: 'Invalid coupon code' }
  const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { valid: false, error: 'Coupon expired' }
  if (coupon.minOrder && cartTotal < coupon.minOrder) return { valid: false, error: `Minimum order ₹${coupon.minOrder}` }
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return { valid: false, error: 'Coupon usage limit reached' }
  return { valid: true, coupon }
}

// ─── Campaign Operations ────────────────────────────────────────
export async function createCampaign(data) {
  const id = `campaign_${Date.now()}`
  return createEntity(COLLECTIONS.CAMPAIGNS, id, data)
}

export async function updateCampaign(id, data) {
  return updateEntity(COLLECTIONS.CAMPAIGNS, id, data)
}

export async function deleteCampaign(id) {
  return deleteEntity(COLLECTIONS.CAMPAIGNS, id)
}

export async function getCampaigns() {
  return getEntities(COLLECTIONS.CAMPAIGNS)
}

// ─── Settings Operations ────────────────────────────────────────
export async function getSettings() {
  const snap = await safeGetDoc(doc(db, COLLECTIONS.SETTINGS, 'store'))
  return snap.exists() ? snap.data() : {}
}

export async function saveSettings(data) {
  await setDoc(doc(db, COLLECTIONS.SETTINGS, 'store'), { ...data, updatedAt: new Date().toISOString() })
  return data
}

// ─── Dashboard Stats ────────────────────────────────────────────
export async function getDashboardStats() {
  const [orders, inventory, customers, products] = await Promise.all([
    getEntities('orders'),
    getAllInventory(),
    getEntities('customers'),
    getEntities('products'),
  ])
  const today = new Date().toISOString().split('T')[0]
  const todayOrders = orders.filter(o => o.createdAt?.startsWith(today))
  const pendingOrders = orders.filter(o => o.status === 'pending')
  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0)
  const lowStock = inventory.filter(i => i.quantity <= (i.reorderLevel || 5) && i.quantity > 0)
  const outOfStock = inventory.filter(i => i.quantity === 0)
  return {
    todayOrders: todayOrders.length,
    pendingOrders: pendingOrders.length,
    totalRevenue: revenue,
    totalOrders: orders.length,
    totalCustomers: customers.length,
    totalProducts: products.length,
    totalInventory: inventory.reduce((s, i) => s + (i.quantity || 0), 0),
    lowStockCount: lowStock.length,
    outOfStockCount: outOfStock.length,
    lowStock,
    outOfStock,
    recentOrders: orders.slice(0, 5),
  }
}

// ─── Media Library Operations ───────────────────────────────────
export async function uploadMedia(data) {
  const id = `media_${Date.now()}`
  return createEntity(COLLECTIONS.MEDIA, id, data)
}

export async function getMedia() {
  return getEntities(COLLECTIONS.MEDIA, [orderBy('createdAt', 'desc')])
}

export async function deleteMedia(id) {
  return deleteEntity(COLLECTIONS.MEDIA, id)
}

export async function updateMedia(id, data) {
  return updateEntity(COLLECTIONS.MEDIA, id, data)
}

// ─── Brand Operations ───────────────────────────────────────────
export async function createBrand(data) {
  const id = `brand_${Date.now()}`
  return createEntity(COLLECTIONS.BRANDS, id, data)
}

export async function updateBrand(id, data) {
  return updateEntity(COLLECTIONS.BRANDS, id, data)
}

export async function deleteBrand(id) {
  return deleteEntity(COLLECTIONS.BRANDS, id)
}

export async function getBrands() {
  return getEntities(COLLECTIONS.BRANDS)
}

// ─── Tag Operations ─────────────────────────────────────────────
export async function createTag(data) {
  const id = `tag_${Date.now()}`
  return createEntity(COLLECTIONS.TAGS, id, data)
}

export async function updateTag(id, data) {
  return updateEntity(COLLECTIONS.TAGS, id, data)
}

export async function deleteTag(id) {
  return deleteEntity(COLLECTIONS.TAGS, id)
}

export async function getTags() {
  return getEntities(COLLECTIONS.TAGS)
}

// ─── Review Operations ──────────────────────────────────────────
export async function getReviews(productId) {
  const q = productId
    ? query(collection(db, COLLECTIONS.REVIEWS), where('productId', '==', productId), orderBy('createdAt', 'desc'))
    : query(collection(db, COLLECTIONS.REVIEWS), orderBy('createdAt', 'desc'))
  const snap = await safeGet(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function updateReview(id, data) {
  return updateEntity(COLLECTIONS.REVIEWS, id, data)
}

export async function deleteReview(id) {
  return deleteEntity(COLLECTIONS.REVIEWS, id)
}

// ─── Wishlist Operations ────────────────────────────────────────
export async function getWishlist() {
  return getEntities(COLLECTIONS.WISHLIST)
}

// ─── Attribute Operations ───────────────────────────────────────
export async function createAttribute(data) {
  const id = `attr_${Date.now()}`
  return createEntity(COLLECTIONS.ATTRIBUTES, id, data)
}

export async function updateAttribute(id, data) {
  return updateEntity(COLLECTIONS.ATTRIBUTES, id, data)
}

export async function deleteAttribute(id) {
  return deleteEntity(COLLECTIONS.ATTRIBUTES, id)
}

export async function getAttributes() {
  return getEntities(COLLECTIONS.ATTRIBUTES)
}

// ─── Notification Operations ────────────────────────────────────
export async function createNotification(data) {
  const id = `notif_${Date.now()}`
  return createEntity(COLLECTIONS.NOTIFICATIONS, id, data)
}

export async function getNotifications(userId) {
  const q = userId
    ? query(collection(db, COLLECTIONS.NOTIFICATIONS), where('userId', '==', userId), orderBy('createdAt', 'desc'))
    : query(collection(db, COLLECTIONS.NOTIFICATIONS), orderBy('createdAt', 'desc'))
  const snap = await safeGet(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function markNotificationRead(id) {
  return updateEntity(COLLECTIONS.NOTIFICATIONS, id, { read: true })
}

export async function markAllNotificationsRead(userId) {
  const notifs = await getNotifications(userId)
  const batch = writeBatch(db)
  for (const n of notifs.filter(n => !n.read)) {
    batch.update(doc(db, COLLECTIONS.NOTIFICATIONS, n.id), { read: true })
  }
  await batch.commit()
  return notifs.length
}

// ─── Contact Messages Operations ────────────────────────────────
export async function getContactMessages() {
  return getEntities(COLLECTIONS.CONTACT_MESSAGES, [orderBy('createdAt', 'desc')])
}

export async function markMessageRead(id) {
  return updateEntity(COLLECTIONS.CONTACT_MESSAGES, id, { read: true })
}

export async function deleteMessage(id) {
  return deleteEntity(COLLECTIONS.CONTACT_MESSAGES, id)
}

// ─── Newsletter Operations ──────────────────────────────────────
export async function getNewsletterSubscribers() {
  return getEntities(COLLECTIONS.NEWSLETTER, [orderBy('createdAt', 'desc')])
}

export async function deleteSubscriber(id) {
  return deleteEntity(COLLECTIONS.NEWSLETTER, id)
}
