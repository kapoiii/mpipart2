'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Trip } from '@/types'
import { formatRupiah, calcRemainingQuota } from '@/lib/utils'
import {
  IconChevronLeft,
  IconChevronRight,
  IconArrowRight,
  IconMapPin,
  IconCheck,
  IconLightning,
} from '@/components/icons'

interface GlobeSliderProps {
  trips: Trip[]
}

export default function GlobeSlider({ trips }: GlobeSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const total = trips?.length || 0

  const handleNext = useCallback(() => {
    if (total <= 1 || isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev + 1) % total)
    setTimeout(() => setIsAnimating(false), 500)
  }, [isAnimating, total])

  const handlePrev = useCallback(() => {
    if (total <= 1 || isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev - 1 + total) % total)
    setTimeout(() => setIsAnimating(false), 500)
  }, [isAnimating, total])

  const handleSelect = (index: number) => {
    if (index === currentIndex || isAnimating) return
    setIsAnimating(true)
    setCurrentIndex(index)
    setTimeout(() => setIsAnimating(false), 500)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev])

  // Autoplay (7 seconds) with pause on hover
  useEffect(() => {
    if (isPaused || total <= 1) return
    const interval = setInterval(() => {
      handleNext()
    }, 7000)
    return () => clearInterval(interval)
  }, [handleNext, isPaused, total])

  if (!trips || trips.length === 0) {
    return null
  }

  const current = trips[currentIndex] || trips[0]
  const remainingQuota = calcRemainingQuota(current.quota, current._bookingsCount || 0)

  // Split title into 2 punchy lines for the hero display
  const words = current.title.split(' ')
  const midPoint = Math.ceil(words.length / 2)
  const line1 = words.slice(0, midPoint).join(' ')
  const line2 = words.slice(midPoint).join(' ')

  // Calculate upcoming preview cards (carousel on the right)
  const previewCards: { trip: Trip; index: number }[] = []
  if (total > 1) {
    const maxPreviews = Math.min(4, total - 1)
    for (let i = 1; i <= maxPreviews; i++) {
      const idx = (currentIndex + i) % total
      previewCards.push({
        trip: trips[idx],
        index: idx,
      })
    }
  }

  return (
    <div
      className="globe-hero-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slides using real trip images from database */}
      {trips.map((trip, idx) => {
        const isActive = idx === currentIndex
        return (
          <div
            key={trip.id}
            className="absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-in-out"
            style={{
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 1 : 0,
            }}
          >
            <div
              className={`w-full h-full bg-cover bg-center transition-transform duration-1000 ${
                isActive ? 'animate-kenburns scale-105' : 'scale-100'
              }`}
              style={{
                backgroundImage: `url(${trip.image})`,
              }}
            />
          </div>
        )
      })}

      {/* Cinematic Overlays */}
      <div className="globe-slide-overlay z-[2]" />
      <div className="globe-slide-gradient-left z-[3]" />

      {/* Main Hero Content Area - with generous pt-32/pt-36 to avoid overlapping with fixed Navbar */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between pt-32 sm:pt-36 md:pt-40 pb-8 sm:pb-10 px-6 md:px-12 lg:px-16 max-w-[1700px] mx-auto pointer-events-none">
        
        {/* Center Section: Hero Left Typography + Hero Right Cards */}
        <div className="flex-1 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 my-auto pointer-events-auto">
          {/* Left Column: Real Trip Data */}
          <div className="max-w-xl lg:max-w-2xl text-left">
            {/* Location & Duration Tag */}
            <div
              key={`loc-${currentIndex}`}
              className="animate-slide-up-text flex items-center gap-2 text-amber-400 text-xs sm:text-sm font-bold tracking-widest uppercase mb-3 drop-shadow"
            >
              <IconMapPin size={16} color="#f59e0b" />
              <span className="text-amber-400 font-extrabold">{current.location}</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-white/80 font-semibold tracking-wider">
                {current.duration}
              </span>
            </div>

            {/* Giant Title from Database - styled explicitly in pure white & amber with heavy drop shadow */}
            <h1
              key={`title-${currentIndex}`}
              className="font-display font-black uppercase tracking-tight leading-[0.95] text-4xl sm:text-6xl md:text-7xl lg:text-[5rem] drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] mb-4 animate-slide-up-text"
              style={{ color: '#ffffff' }}
            >
              <span className="block text-white" style={{ color: '#ffffff' }}>
                {line1}
              </span>
              {line2 && (
                <span className="block text-amber-300" style={{ color: '#fcd34d' }}>
                  {line2}
                </span>
              )}
            </h1>

            {/* Description from Database */}
            <p
              key={`desc-${currentIndex}`}
              className="text-slate-100 text-sm md:text-base leading-relaxed max-w-lg mb-8 font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] animate-slide-up-text line-clamp-3 md:line-clamp-none"
              style={{ animationDelay: '100ms' }}
            >
              {current.description}
            </p>

            {/* CTA Buttons & Price */}
            <div
              key={`action-${currentIndex}`}
              className="flex flex-wrap items-center gap-4 animate-slide-up-text"
              style={{ animationDelay: '180ms' }}
            >
              <Link
                href={`/trips/${current.id}`}
                className="btn-discover group cursor-pointer text-decoration-none"
              >
                <span className="circle-indicator group-hover:rotate-45 transition-transform duration-300">
                  <IconArrowRight size={16} color="#0f172a" />
                </span>
                <span>Pesan Trip Ini</span>
              </Link>

              <div className="px-5 py-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center gap-3 shadow-lg">
                <div className="text-left">
                  <span className="block text-[10px] text-white/70 font-semibold uppercase tracking-wider">
                    Mulai dari
                  </span>
                  <span className="text-base md:text-lg font-black text-amber-300 leading-none">
                    {formatRupiah(current.price)}
                  </span>
                </div>
                <span className="text-white/50 text-xs font-medium">/pax</span>
              </div>

              {/* Quota Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs shadow-md">
                {remainingQuota > 0 ? (
                  <>
                    <IconCheck size={14} color="#10b981" />
                    <span className="text-emerald-400 font-bold">
                      Sisa {remainingQuota} Slot
                    </span>
                  </>
                ) : (
                  <>
                    <IconLightning size={14} color="#f43f5e" />
                    <span className="text-rose-400 font-bold">Kuota Penuh</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sliding Carousel Cards using Real Database Trips */}
          {previewCards.length > 0 && (
            <div className="w-full lg:w-auto flex items-center gap-4 overflow-x-auto no-scrollbar py-4 px-1 lg:overflow-visible">
              {previewCards.map(({ trip, index }, i) => (
                <div
                  key={trip.id}
                  onClick={() => handleSelect(index)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Lihat ${trip.title}`}
                  className="globe-card shrink-0 w-[165px] sm:w-[185px] lg:w-[200px] h-[250px] sm:h-[285px] lg:h-[305px] group relative focus:outline-none focus:ring-2 focus:ring-amber-400"
                  style={{
                    transitionDelay: `${i * 40}ms`,
                  }}
                >
                  {/* Card Image from Database */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${trip.image})`,
                    }}
                  />

                  {/* High Contrast Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20 group-hover:from-black transition-colors" />

                  {/* Top Index & Duration */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] text-white font-bold uppercase tracking-wider">
                    <span className="bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 text-white font-bold">
                      0{index + 1}
                    </span>
                    <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black shadow">
                      {trip.duration}
                    </span>
                  </div>

                  {/* Card Content Bottom - explicitly bright white for crystal clarity */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end text-left bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest line-clamp-1 mb-1">
                      {trip.location}
                    </span>
                    <h3
                      className="font-display font-extrabold text-white uppercase text-base sm:text-lg leading-tight tracking-wide group-hover:text-amber-200 transition-colors line-clamp-2 drop-shadow"
                      style={{ color: '#ffffff' }}
                    >
                      {trip.title}
                    </h3>
                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/20">
                      <span className="text-xs font-black text-white" style={{ color: '#ffffff' }}>
                        {formatRupiah(trip.price)}
                      </span>
                      <span className="text-amber-400 text-xs font-black group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Bar: Prev/Next Buttons, Progress Bar & Slide Counter */}
        <div className="relative z-10 w-full flex items-center justify-between gap-4 md:gap-8 pt-6 border-t border-white/15 pointer-events-auto">
          {/* Previous & Next Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={isAnimating || total <= 1}
              aria-label="Previous Slide"
              className="slider-control-btn group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <IconChevronLeft
                size={22}
                color="#ffffff"
                className="group-hover:-translate-x-0.5 transition-transform"
              />
            </button>
            <button
              onClick={handleNext}
              disabled={isAnimating || total <= 1}
              aria-label="Next Slide"
              className="slider-control-btn group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <IconChevronRight
                size={22}
                color="#ffffff"
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </div>

          {/* Progress Bar Track */}
          <div className="flex-1 max-w-md mx-2 sm:mx-6 flex items-center gap-3">
            <div className="relative w-full h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-amber-200 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(245,158,11,0.7)]"
                style={{
                  width: `${((currentIndex + 1) / total) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Slide Numeric Counter */}
          <div className="flex items-baseline gap-1 text-right select-none">
            <span
              className="font-display font-extrabold text-white text-3xl sm:text-4xl tracking-tighter leading-none"
              style={{ color: '#ffffff' }}
            >
              0{currentIndex + 1}
            </span>
            <span className="text-white/50 text-xs sm:text-sm font-bold tracking-wider">
              / 0{total}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
