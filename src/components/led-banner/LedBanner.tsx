'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface LedBannerProps {
  text: string
  enabled: boolean
  color: string
  fontFamily: string
  style: 'fixed' | 'blinking'
  speed: number
  className?: string
}

export default function LedBanner({ 
  text, 
  enabled, 
  color, 
  fontFamily, 
  style, 
  speed, 
  className 
}: LedBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!enabled || !text) return

    let animationId: number
    let blinkId: number

    const animate = () => {
      if (!containerRef.current || !textRef.current) return

      const containerWidth = containerRef.current.offsetWidth
      const textWidth = textRef.current.offsetWidth

      if (textWidth > containerWidth) {
        setPosition(prev => {
          const newPos = prev - speed
          return newPos < -textWidth ? containerWidth : newPos
        })
      }

      animationId = requestAnimationFrame(animate)
    }

    const blink = () => {
      if (style === 'blinking') {
        setIsVisible(prev => !prev)
      }
      blinkId = setTimeout(blink, 500) // Clignote toutes les 500ms
    }

    if (enabled) {
      animate()
      if (style === 'blinking') {
        blink()
      } else {
        setIsVisible(true)
      }
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (blinkId) clearTimeout(blinkId)
    }
  }, [enabled, text, style, speed])

  if (!enabled || !text) return null

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-8 overflow-hidden bg-black border-y border-green-500",
        "shadow-[inset_0_0_10px_rgba(0,255,0,0.3)]",
        className
      )}
    >
      {/* Effet LED */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent animate-pulse"></div>
      
      {/* Texte défilant */}
      <div 
        ref={textRef}
        className={cn(
          "absolute whitespace-nowrap font-mono font-bold text-lg",
          "drop-shadow-[0_0_8px_currentColor] transform",
          !isVisible && "opacity-0",
          `text-[${color}]`,
          `font-[${fontFamily}]`
        )}
        style={{ 
          left: `${position}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          color: color,
          fontFamily: fontFamily
        }}
      >
        {text}
      </div>

      {/* Effets de bords LED */}
      <div className="absolute left-0 top-0 w-1 h-full bg-green-500 shadow-[0_0_10px_rgba(0,255,0,0.8)]"></div>
      <div className="absolute right-0 top-0 w-1 h-full bg-green-500 shadow-[0_0_10px_rgba(0,255,0,0.8)]"></div>
    </div>
  )
}