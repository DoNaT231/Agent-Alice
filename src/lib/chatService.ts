import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'
import type { ChatMessage, Conversation } from '../types/chat'
import { generateConversationTitle } from './conversationUtils'

function toMillis(value: Timestamp | number | undefined): number {
  if (value instanceof Timestamp) return value.toMillis()
  if (typeof value === 'number') return value
  return Date.now()
}

function mapConversation(snapshot: QueryDocumentSnapshot<DocumentData>): Conversation {
  const data = snapshot.data()

  return {
    id: snapshot.id,
    projectId: (data.projectId as string | null | undefined) ?? null,
    title: (data.title as string) ?? 'New chat',
    summary: (data.summary as string) ?? '',
    lastMessage: (data.lastMessage as string) ?? '',
    archived: Boolean(data.archived),
    createdAt: toMillis(data.createdAt as Timestamp | number | undefined),
    updatedAt: toMillis(data.updatedAt as Timestamp | number | undefined),
  }
}

function mapMessage(snapshot: QueryDocumentSnapshot<DocumentData>): ChatMessage {
  const data = snapshot.data()

  return {
    id: snapshot.id,
    role: data.role as ChatMessage['role'],
    content: data.content as string,
    model: data.model as string | undefined,
    moduleUsed: (data.moduleUsed as ChatMessage['moduleUsed']) ?? null,
    createdAt: toMillis(data.createdAt as Timestamp | number | undefined),
  }
}

function conversationsCollection(userId: string) {
  return collection(db, 'users', userId, 'conversations')
}

function messagesCollection(userId: string, conversationId: string) {
  return collection(db, 'users', userId, 'conversations', conversationId, 'messages')
}

export async function createConversation(
  userId: string,
  firstMessage?: string,
  projectId?: string | null,
): Promise<string> {
  const docRef = doc(conversationsCollection(userId))
  const title = firstMessage ? generateConversationTitle(firstMessage) : 'New chat'

  await setDoc(docRef, {
    id: docRef.id,
    projectId: projectId ?? null,
    title,
    summary: '',
    lastMessage: firstMessage ?? '',
    archived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export async function listConversations(userId: string): Promise<Conversation[]> {
  const q = query(conversationsCollection(userId), orderBy('updatedAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(mapConversation)
}

export async function listConversationsByProject(
  userId: string,
  projectId: string,
): Promise<Conversation[]> {
  const q = query(
    conversationsCollection(userId),
    where('projectId', '==', projectId),
    orderBy('updatedAt', 'desc'),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(mapConversation)
}

export function subscribeToConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void,
): () => void {
  const q = query(conversationsCollection(userId), orderBy('updatedAt', 'desc'))

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(mapConversation))
  })
}

export function subscribeToConversationsByProject(
  userId: string,
  projectId: string,
  callback: (conversations: Conversation[]) => void,
): () => void {
  const q = query(
    conversationsCollection(userId),
    where('projectId', '==', projectId),
    orderBy('updatedAt', 'desc'),
  )

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(mapConversation))
  })
}

export async function getMessages(
  userId: string,
  conversationId: string,
): Promise<ChatMessage[]> {
  const q = query(messagesCollection(userId, conversationId), orderBy('createdAt', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(mapMessage)
}

export function subscribeToMessages(
  userId: string,
  conversationId: string,
  callback: (messages: ChatMessage[]) => void,
): () => void {
  const q = query(messagesCollection(userId, conversationId), orderBy('createdAt', 'asc'))

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(mapMessage))
  })
}

export async function addMessage(
  userId: string,
  conversationId: string,
  message: Omit<ChatMessage, 'id' | 'createdAt'>,
): Promise<void> {
  const docRef = doc(messagesCollection(userId, conversationId))

  await setDoc(docRef, {
    id: docRef.id,
    role: message.role,
    content: message.content,
    model: message.model ?? null,
    moduleUsed: message.moduleUsed ?? null,
    createdAt: serverTimestamp(),
  })
}

export async function updateConversationLastMessage(
  userId: string,
  conversationId: string,
  lastMessage: string,
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'conversations', conversationId)

  await updateDoc(docRef, {
    lastMessage,
    updatedAt: serverTimestamp(),
  })
}

export async function updateConversationTitle(
  userId: string,
  conversationId: string,
  title: string,
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'conversations', conversationId)

  await updateDoc(docRef, {
    title,
    updatedAt: serverTimestamp(),
  })
}

export async function updateConversationProject(
  userId: string,
  conversationId: string,
  projectId: string | null,
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'conversations', conversationId)

  await updateDoc(docRef, {
    projectId,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteConversation(
  userId: string,
  conversationId: string,
): Promise<void> {
  const messagesSnapshot = await getDocs(messagesCollection(userId, conversationId))
  const batch = writeBatch(db)

  messagesSnapshot.docs.forEach((messageDoc) => {
    batch.delete(messageDoc.ref)
  })

  batch.delete(doc(db, 'users', userId, 'conversations', conversationId))
  await batch.commit()
}

export async function getConversation(
  userId: string,
  conversationId: string,
): Promise<Conversation | null> {
  const docRef = doc(db, 'users', userId, 'conversations', conversationId)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) return null

  return mapConversation(snapshot as QueryDocumentSnapshot<DocumentData>)
}
