import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../../../firebase/firestore'
import type { EmailDraft, EmailDraftCreateInput } from '../types'

function toMillis(value: Timestamp | number | undefined): number {
  if (value instanceof Timestamp) return value.toMillis()
  if (typeof value === 'number') return value
  return Date.now()
}

function emailDraftsCollection(userId: string) {
  return collection(db, 'users', userId, 'emailDrafts')
}

function mapEmailDraft(snapshot: QueryDocumentSnapshot<DocumentData>): EmailDraft {
  const data = snapshot.data()

  return {
    id: snapshot.id,
    type: (data.type as EmailDraft['type']) ?? 'outreach',
    to: (data.to as string) ?? '',
    subject: (data.subject as string) ?? '',
    body: (data.body as string) ?? '',
    status: (data.status as EmailDraft['status']) ?? 'draft',
    source: (data.source as EmailDraft['source']) ?? 'chat',
    createdAt: toMillis(data.createdAt as Timestamp | number | undefined),
    updatedAt: toMillis(data.updatedAt as Timestamp | number | undefined),
    approvedAt: data.approvedAt
      ? toMillis(data.approvedAt as Timestamp | number)
      : null,
    sentAt: data.sentAt ? toMillis(data.sentAt as Timestamp | number) : null,
  }
}

export async function createEmailDraft(
  userId: string,
  draft: EmailDraftCreateInput,
): Promise<string> {
  const docRef = doc(emailDraftsCollection(userId))

  await setDoc(docRef, {
    id: docRef.id,
    type: draft.type,
    to: draft.to,
    subject: draft.subject,
    body: draft.body,
    status: draft.status,
    source: draft.source,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    approvedAt: null,
    sentAt: null,
  })

  return docRef.id
}

export async function updateEmailDraft(
  userId: string,
  draftId: string,
  updates: Partial<Pick<EmailDraft, 'to' | 'subject' | 'body' | 'status'>>,
): Promise<void> {
  await updateDoc(doc(db, 'users', userId, 'emailDrafts', draftId), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

export async function markEmailDraftSentMock(userId: string, draftId: string): Promise<void> {
  await updateDoc(doc(db, 'users', userId, 'emailDrafts', draftId), {
    status: 'sent_mock',
    sentAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function getEmailDraft(
  userId: string,
  draftId: string,
): Promise<EmailDraft | null> {
  const snapshot = await getDoc(doc(db, 'users', userId, 'emailDrafts', draftId))
  if (!snapshot.exists()) return null
  return mapEmailDraft(snapshot as QueryDocumentSnapshot<DocumentData>)
}
