'use client'

import { useEffect } from 'react'

// Boots the original jQuery/Box2D game once the static markup is in the DOM.
export function Game() {
  useEffect(() => {
    import('@/game/main').then(({ boot }) => boot())
  }, [])

  return null
}
