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
