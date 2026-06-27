import {
  collection,
  deleteDoc,
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
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Project, ProjectTone } from '../types/chat'

function toMillis(value: Timestamp | number | undefined): number {
  if (value instanceof Timestamp) return value.toMillis()
  if (typeof value === 'number') return value
  return Date.now()
}

function mapProject(snapshot: QueryDocumentSnapshot<DocumentData>): Project {
  const data = snapshot.data()

  return {
    id: snapshot.id,
    name: (data.name as string) ?? 'Untitled project',
    description: (data.description as string) ?? '',
    instructions: (data.instructions as string) ?? '',
    summary: (data.summary as string) ?? '',
    defaultTone: (data.defaultTone as ProjectTone | null | undefined) ?? null,
    archived: Boolean(data.archived),
    createdAt: toMillis(data.createdAt as Timestamp | number | undefined),
    updatedAt: toMillis(data.updatedAt as Timestamp | number | undefined),
  }
}

function projectsCollection(userId: string) {
  return collection(db, 'users', userId, 'projects')
}

export async function createProject(
  userId: string,
  data: {
    name: string
    description?: string
    instructions?: string
    defaultTone?: ProjectTone | null
  },
): Promise<string> {
  const docRef = doc(projectsCollection(userId))

  await setDoc(docRef, {
    id: docRef.id,
    name: data.name,
    description: data.description ?? '',
    instructions: data.instructions ?? '',
    summary: '',
    defaultTone: data.defaultTone ?? null,
    archived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export async function listProjects(userId: string): Promise<Project[]> {
  const q = query(projectsCollection(userId), orderBy('updatedAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(mapProject)
}

export function subscribeToProjects(
  userId: string,
  callback: (projects: Project[]) => void,
): () => void {
  const q = query(projectsCollection(userId), orderBy('updatedAt', 'desc'))

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(mapProject))
  })
}

export async function getProject(
  userId: string,
  projectId: string,
): Promise<Project | null> {
  const docRef = doc(db, 'users', userId, 'projects', projectId)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) return null

  return mapProject(snapshot as QueryDocumentSnapshot<DocumentData>)
}

export async function updateProject(
  userId: string,
  projectId: string,
  data: Partial<
    Pick<Project, 'name' | 'description' | 'instructions' | 'summary' | 'defaultTone' | 'archived'>
  >,
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'projects', projectId)

  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteProject(userId: string, projectId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'projects', projectId))
}
