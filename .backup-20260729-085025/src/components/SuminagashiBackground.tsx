import { useEffect, useRef } from 'react'

type InkParticle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  life: number
  maxLife: number
  hue: number
}

const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v))

const hashNoise = (x: number, y: number): number => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

const smoothNoise = (x: number, y: number): number => {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const xf = x - x0
  const yf = y - y0

  const a = hashNoise(x0, y0)
  const b = hashNoise(x0 + 1, y0)
  const c = hashNoise(x0, y0 + 1)
  const d = hashNoise(x0 + 1, y0 + 1)

  const ux = xf * xf * (3 - 2 * xf)
  const uy = yf * yf * (3 - 2 * yf)

  return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy
}

const fractalNoise = (x: number, y: number): number => {
  let value = 0
  let amp = 1
  let freq = 1
  let norm = 0
  for (let i = 0; i < 4; i += 1) {
    value += smoothNoise(x * freq, y * freq) * amp
    norm += amp
    amp *= 0.5
    freq *= 2
  }
  return value / norm
}

const spawnFromPointer = (
  particles: InkParticle[],
  x: number,
  y: number,
  intensity: number,
  accentChance: number
): void => {
  const count = Math.round(2 + intensity * 5)
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * (0.3 + intensity * 2)
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 12 + Math.random() * 42,
      alpha: 0.07 + Math.random() * 0.18,
      life: 0,
      maxLife: 180 + Math.random() * 210,
      hue: Math.random() < accentChance ? 8 : 0
    })
  }
}

const SuminagashiBackground = (): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    let dpr = window.devicePixelRatio || 1
    const particles: InkParticle[] = []
    let rafId = 0
    let time = 0
    const pointer = {
      x: width * 0.5,
      y: height * 0.5,
      px: width * 0.5,
      py: height * 0.5,
      active: false
    }

    const resize = (): void => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()

    for (let i = 0; i < 140; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: 18 + Math.random() * 70,
        alpha: 0.03 + Math.random() * 0.08,
        life: Math.random() * 240,
        maxLife: 240 + Math.random() * 240,
        hue: Math.random() < 0.08 ? 8 : 0
      })
    }

    const draw = (): void => {
      time += 0.0035

      ctx.fillStyle = 'rgba(247, 243, 234, 0.22)'
      ctx.fillRect(0, 0, width, height)

      const pointerDx = pointer.x - pointer.px
      const pointerDy = pointer.y - pointer.py
      const pointerSpeed = Math.hypot(pointerDx, pointerDy)
      pointer.px = pointer.x
      pointer.py = pointer.y

      if (pointer.active && pointerSpeed > 0.2) {
        spawnFromPointer(particles, pointer.x, pointer.y, clamp(pointerSpeed * 0.08, 0.4, 2), 0.18)
      }

      while (particles.length > 520) particles.shift()

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i]
        p.life += 1

        const n = fractalNoise(p.x * 0.002 + time, p.y * 0.002 + time * 0.7)
        const angle = n * Math.PI * 4
        const flow = 0.08
        p.vx += Math.cos(angle) * flow
        p.vy += Math.sin(angle) * flow

        if (pointer.active) {
          const dx = p.x - pointer.x
          const dy = p.y - pointer.y
          const dist = Math.hypot(dx, dy) + 0.001
          if (dist < 220) {
            const repel = (220 - dist) * 0.0008
            p.vx += (dx / dist) * repel
            p.vy += (dy / dist) * repel
          }
        }

        p.vx *= 0.96
        p.vy *= 0.96
        p.x += p.vx
        p.y += p.vy

        if (p.x < -120) p.x = width + 120
        if (p.x > width + 120) p.x = -120
        if (p.y < -120) p.y = height + 120
        if (p.y > height + 120) p.y = -120

        const lifeRatio = 1 - p.life / p.maxLife
        if (lifeRatio <= 0) {
          particles[i] = {
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: 12 + Math.random() * 60,
            alpha: 0.03 + Math.random() * 0.1,
            life: 0,
            maxLife: 180 + Math.random() * 260,
            hue: Math.random() < 0.06 ? 8 : 0
          }
          continue
        }

        const drift = 1 + Math.sin((p.life / p.maxLife) * Math.PI) * 0.2
        const radius = p.size * drift
        const alpha = p.alpha * lifeRatio
        const color = p.hue === 8
          ? `hsla(8, 73%, 44%, ${alpha})`
          : `hsla(0, 0%, 9%, ${alpha})`

        const g = ctx.createRadialGradient(p.x, p.y, radius * 0.05, p.x, p.y, radius)
        g.addColorStop(0, color)
        g.addColorStop(1, 'hsla(0, 0%, 100%, 0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
        ctx.fill()
      }

      rafId = window.requestAnimationFrame(draw)
    }

    const onPointerMove = (clientX: number, clientY: number): void => {
      pointer.x = clientX
      pointer.y = clientY
      pointer.active = true
    }

    const handleMouseMove = (event: MouseEvent): void => {
      onPointerMove(event.clientX, event.clientY)
    }

    const handleTouchMove = (event: TouchEvent): void => {
      const touch = event.touches[0]
      if (!touch) return
      onPointerMove(touch.clientX, touch.clientY)
    }

    const handlePointerLeave = (): void => {
      pointer.active = false
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchstart', handleTouchMove, { passive: true })
    window.addEventListener('mouseleave', handlePointerLeave)
    window.addEventListener('touchend', handlePointerLeave)

    rafId = window.requestAnimationFrame(draw)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchstart', handleTouchMove)
      window.removeEventListener('mouseleave', handlePointerLeave)
      window.removeEventListener('touchend', handlePointerLeave)
    }
  }, [])

  return <canvas className="suminagashi-canvas" ref={canvasRef} aria-hidden="true" />
}

export default SuminagashiBackground