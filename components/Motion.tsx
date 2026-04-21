'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'

/* ─── Variants ─────────────────────────────────────────────── */
const fadeUpVariant = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
}

/* ─── FadeUp ────────────────────────────────────────────────── */
export function FadeUp({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── SlideIn ───────────────────────────────────────────────── */
export function SlideIn({ children, className, from = 'left' }: { children: React.ReactNode; className?: string; from?: 'left' | 'right' }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: from === 'left' ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── StaggerContainer ──────────────────────────────────────── */
export function StaggerContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className={className}>
      {children}
    </motion.div>
  )
}

/* ─── StaggerItem ───────────────────────────────────────────── */
export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeUpVariant} className={className}>
      {children}
    </motion.div>
  )
}

/* ─── ScaleOnHover ──────────────────────────────────────────── */
export function ScaleOnHover({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }} className={className}>
      {children}
    </motion.div>
  )
}

/* ─── TiltCard ──────────────────────────────────────────────── */
export function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 })

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current!.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const reset = () => { x.set(0); y.set(0) }

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── HoverGlow ─────────────────────────────────────────────── */
export function HoverGlow({ children, className, color = 'green' }: { children: React.ReactNode; className?: string; color?: 'green' | 'cyan' | 'magenta' }) {
  const shadows: Record<string, string> = {
    green:   '0 0 30px rgba(0,255,135,0.35)',
    cyan:    '0 0 30px rgba(0,229,255,0.35)',
    magenta: '0 0 30px rgba(255,0,200,0.35)',
  }
  return (
    <motion.div
      whileHover={{ boxShadow: shadows[color], y: -4 }}
      transition={{ duration: 0.25 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── PageTransition ────────────────────────────────────────── */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ─── AnimatedCounter ───────────────────────────────────────── */
export function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { stiffness: 60, damping: 20 })

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { motionVal.set(value); observer.disconnect() }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value, motionVal])

  useEffect(() => spring.on('change', (v) => {
    if (ref.current) ref.current.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`
  }), [spring, prefix, suffix, decimals])

  return <span ref={ref}>{prefix}0{suffix}</span>
}
