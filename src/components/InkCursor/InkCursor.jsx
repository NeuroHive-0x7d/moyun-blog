import { useEffect, useState, useRef, useCallback } from 'react'

function Ripple({ x, y, id, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 700)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <span
      className="ink-ripple"
      style={{
        left: x,
        top: y,
        width: 0,
        height: 0,
      }}
    />
  )
}

export default function InkCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [hover, setHover] = useState(false)
  const [ripples, setRipples] = useState([])
  const [visible, setVisible] = useState(false)
  const idRef = useRef(0)

  useEffect(() => {
    const onMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY })
      if (!visible) setVisible(true)
    }
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    // Track hover on interactive elements
    const onOver = (e) => {
      const el = e.target.closest('a, button, [role="button"], input, textarea, select, .cursor-pointer, .cursor-zoom-in')
      if (el) setHover(true)
    }
    const onOut = (e) => {
      const el = e.target.closest('a, button, [role="button"], input, textarea, select, .cursor-pointer, .cursor-zoom-in')
      if (el) setHover(false)
    }
    document.addEventListener('mouseover', onOver, { passive: true })
    document.addEventListener('mouseout', onOut, { passive: true })

    // Click ripple + reset hover
    const onClick = (e) => {
      const id = ++idRef.current
      setRipples((prev) => [
        ...prev,
        { id, x: e.clientX, y: e.clientY },
      ])
      // Re-check hover after click since mouseover won't re-fire on same element
      setHover(false)
      requestAnimationFrame(() => {
        const el = document.elementFromPoint(e.clientX, e.clientY)
        if (el?.closest('a, button, [role="button"], input, textarea, select, .cursor-pointer, .cursor-zoom-in')) {
          setHover(true)
        }
      })
    }
    document.addEventListener('click', onClick, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.removeEventListener('click', onClick)
    }
  }, [visible])

  const removeRipple = useCallback((id) => {
    setRipples((prev) => prev.filter((r) => r.id !== id))
  }, [])

  // Don't render custom cursor on touch devices
  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  if (isTouchDevice) return null

  return (
    <>
      {/* Cursor */}
      <div
        className="ink-cursor"
        style={{
          left: pos.x,
          top: pos.y,
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Outer ring */}
        <span
          className={`ink-cursor-ring ${hover ? 'hover' : ''}`}
        />
        {/* Inner dot */}
        <span className="ink-cursor-dot" />
      </div>

      {/* Ripples */}
      {ripples.map((r) => (
        <Ripple
          key={r.id}
          x={r.x}
          y={r.y}
          id={r.id}
          onDone={() => removeRipple(r.id)}
        />
      ))}
    </>
  )
}
