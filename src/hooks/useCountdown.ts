import { useCallback, useEffect, useRef, useState } from 'react'

// Wall-clock based countdown: stays accurate even when the browser throttles intervals
export function useCountdown(onDone: () => void) {
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)
  const endAt = useRef(0)
  const doneRef = useRef(onDone)

  useEffect(() => {
    doneRef.current = onDone
  })

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const left = endAt.current - Date.now()
      if (left > 0) {
        setRemaining(left)
        return
      }
      clearInterval(id)
      setRemaining(0)
      setRunning(false)
      doneRef.current()
    }, 200)
    return () => clearInterval(id)
  }, [running])

  const start = useCallback((ms: number) => {
    endAt.current = Date.now() + ms
    setRemaining(ms)
    setRunning(true)
  }, [])

  const pause = useCallback(() => {
    setRemaining(Math.max(0, endAt.current - Date.now()))
    setRunning(false)
  }, [])

  const stop = useCallback(() => {
    setRunning(false)
    setRemaining(0)
  }, [])

  return { remaining, running, start, pause, stop }
}
