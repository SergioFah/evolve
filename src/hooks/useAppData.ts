import { useCallback, useEffect, useRef, useState } from 'react'
import { cloudEnabled, loadRemote, PinError, saveRemote } from '../lib/cloud.ts'
import { defaultData, normalize } from '../lib/data.ts'
import { readJSON, writeJSON } from '../lib/storage.ts'
import type { AppData } from '../types.ts'

export type SyncStatus = 'local' | 'syncing' | 'saved' | 'offline' | 'error'

type Stored = { data: AppData; updatedAt: number; dirty: boolean }

const STATE_KEY = 'evolve:state'

function loadLocal(): Stored {
  const s = readJSON<Stored>(STATE_KEY)
  if (!s) return { data: defaultData(), updatedAt: 0, dirty: false }
  return { data: normalize(s.data), updatedAt: Number(s.updatedAt) || 0, dirty: Boolean(s.dirty) }
}

// Local-first document: every change lands in localStorage immediately and is pushed
// to the cloud shortly after. On open/focus the newest copy (by updatedAt) wins.
export function useAppData(pin: string | null, onPinRejected: () => void) {
  const [stored, setStored] = useState(loadLocal)
  const [status, setStatus] = useState<SyncStatus>(cloudEnabled ? 'syncing' : 'local')
  const storedRef = useRef(stored)
  const rejectRef = useRef(onPinRejected)

  useEffect(() => {
    rejectRef.current = onPinRejected
  })

  useEffect(() => {
    storedRef.current = stored
    writeJSON(STATE_KEY, stored)
  }, [stored])

  const fail = useCallback((e: unknown) => {
    if (e instanceof PinError) rejectRef.current()
    else setStatus(navigator.onLine ? 'error' : 'offline')
  }, [])

  const push = useCallback(
    async (s: Stored) => {
      if (!cloudEnabled || !pin) return
      setStatus('syncing')
      try {
        await saveRemote(pin, s.data, s.updatedAt)
        setStored((cur) => (cur.updatedAt === s.updatedAt ? { ...cur, dirty: false } : cur))
        setStatus('saved')
      } catch (e) {
        fail(e)
      }
    },
    [pin, fail],
  )

  const pull = useCallback(async () => {
    if (!cloudEnabled || !pin) return
    try {
      const remote = await loadRemote(pin)
      const local = storedRef.current
      if (remote.data && remote.updatedAt > local.updatedAt) {
        setStored({ data: normalize(remote.data), updatedAt: remote.updatedAt, dirty: false })
        setStatus('saved')
      } else if (!remote.data || local.updatedAt > remote.updatedAt) {
        await push(local)
      } else {
        setStatus('saved')
      }
    } catch (e) {
      fail(e)
    }
  }, [pin, push, fail])

  useEffect(() => {
    void pull()
    const onVisible = () => {
      if (document.visibilityState === 'visible') void pull()
    }
    const onOnline = () => void pull()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', onOnline)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', onOnline)
    }
  }, [pull])

  useEffect(() => {
    if (!stored.dirty) return
    const t = setTimeout(() => void push(storedRef.current), 800)
    return () => clearTimeout(t)
  }, [stored, push])

  const update = useCallback((fn: (d: AppData) => AppData) => {
    setStored((cur) => ({ data: fn(cur.data), updatedAt: Math.max(Date.now(), cur.updatedAt + 1), dirty: true }))
  }, [])

  return { data: stored.data, update, status }
}
