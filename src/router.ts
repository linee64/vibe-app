import { useEffect, useState } from 'react'

const getPath = () => window.location.hash.replace(/^#/, '') || '/'

export function useRoute() {
  const [path, setPath] = useState(getPath)
  useEffect(() => {
    const on = () => {
      setPath(getPath())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return path
}

export function navigate(path: string) {
  if (getPath() === path) return
  window.location.hash = path
}
