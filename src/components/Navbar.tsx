'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  IconCompass,
  IconSettings,
  IconList,
  IconUser,
  IconLogout,
  IconSearch,
  IconBookmark,
  IconX,
} from '@/components/icons'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('BERANDA')
  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN'

  const isHomePage = pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: 'BERANDA', href: '/' },
    { label: 'KATALOG TRIP', href: '/#catalog-section' },
    { label: 'TENTANG KAMI', href: '/#about-section' },
    { label: 'KONTAK', href: '/#contact-section' },
  ]

  const handleNavClick = (label: string, href: string) => {
    setActiveTab(label)
    setMobileMenuOpen(false)
    if (href.startsWith('/#')) {
      const id = href.replace('/#', '')
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled || !isHomePage
            ? 'bg-slate-950/85 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3 text-white'
            : 'bg-gradient-to-b from-slate-950/70 via-slate-950/30 to-transparent py-4 text-white'
        }`}
      >
        <div className="max-w-[1700px] mx-auto px-6 md:px-12 lg:px-16 flex items-center justify-between">
          {/* Brand Logo (Globe Express / OpenTrip) */}
          <Link
            href="/"
            className="flex items-center gap-3 group text-decoration-none focus:outline-none"
          >
            <div className="relative w-10 h-10 rounded-full border border-amber-400/50 bg-black/40 backdrop-blur-md flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] group-hover:scale-105 group-hover:border-amber-400 transition-all duration-300">
              <IconCompass size={22} color="#f59e0b" />
              <div className="absolute inset-0 rounded-full border border-amber-400/30 animate-pulse pointer-events-none" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold tracking-widest text-lg md:text-xl text-white uppercase leading-tight group-hover:text-amber-300 transition-colors">
                OPEN<span className="text-amber-400">TRIP</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-white/50 -mt-0.5">
                Mountain Expedition
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-10">
            {navItems.map((item) => {
              const isActive = activeTab === item.label
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => handleNavClick(item.label, item.href)}
                  className="relative py-2 text-xs xl:text-sm font-bold tracking-[0.15em] text-white/80 hover:text-white uppercase transition-colors"
                >
                  {/* Active highlight top bar as seen in the video */}
                  {isActive && (
                    <span className="absolute -top-3 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 to-amber-200 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  )}
                  <span className={isActive ? 'text-white' : 'text-slate-300'}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Desktop Right Utilities (Search, Bookmark, Auth) */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Quick Search Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 hover:text-white transition-all cursor-pointer backdrop-blur-md"
              aria-label="Cari Destinasi"
            >
              <IconSearch size={17} color="#ffffff" />
            </button>

            {/* Saved Bookmarks */}
            <Link
              href="/my-bookings"
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 hover:text-white transition-all cursor-pointer backdrop-blur-md"
              title="Pesanan / Bookmark Saya"
            >
              <IconBookmark size={17} color="#ffffff" />
            </Link>

            {/* Session States */}
            {session ? (
              <div className="flex items-center gap-3 pl-2 border-l border-white/15">
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    <IconSettings size={13} color="#f59e0b" />
                    <span>Admin</span>
                  </Link>
                )}

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-900 font-black text-xs flex items-center justify-center">
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-white max-w-[100px] truncate">
                    {session.user?.name}
                  </span>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="p-2 rounded-full hover:bg-rose-500/20 text-white/70 hover:text-rose-300 border border-transparent hover:border-rose-400/30 transition-all cursor-pointer"
                  title="Keluar"
                >
                  <IconLogout size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-white/15">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:text-amber-300 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-extrabold uppercase tracking-wider shadow-lg hover:shadow-amber-500/25 transition-all"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="p-2 rounded-full bg-white/10 border border-white/15 text-white"
            >
              <IconSearch size={16} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-white/10 border border-white/15 text-white focus:outline-none"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? (
                <IconX size={20} color="#ffffff" />
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-slate-950/95 backdrop-blur-2xl border-b border-white/15 px-6 py-6 mt-3 flex flex-col gap-4 animate-fade-in text-white shadow-2xl">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => handleNavClick(item.label, item.href)}
                  className="text-sm font-bold tracking-widest text-white/90 hover:text-amber-400 py-1 uppercase"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              {session ? (
                <>
                  <div className="flex items-center justify-between text-xs text-white/80">
                    <span className="font-semibold">{session.user?.name}</span>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="text-rose-400 hover:text-rose-300 font-bold"
                    >
                      Keluar
                    </button>
                  </div>
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-amber-300 text-xs font-bold uppercase tracking-wider py-1"
                    >
                      Dashboard Admin →
                    </Link>
                  )}
                  <Link
                    href="/my-bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-white text-xs font-semibold py-1"
                  >
                    Pesanan Saya →
                  </Link>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white uppercase"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold uppercase"
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Global Quick Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-white/20 shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm tracking-wider uppercase">
                <IconSearch size={18} />
                <span>Cari Petualangan & Destinasi</span>
              </div>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/70"
              >
                <IconX size={18} />
              </button>
            </div>

            <form
              action="/"
              method="get"
              onSubmit={() => setSearchModalOpen(false)}
              className="mt-4 flex gap-2"
            >
              <input
                name="search"
                autoFocus
                placeholder="Misal: Rinjani, Bromo, Alps, Yosemite..."
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-400 text-sm"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-colors cursor-pointer"
              >
                Cari
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
              <span>Populer:</span>
              {['Rinjani', 'Bromo', 'Prau', 'Switzerland', 'Sahara'].map(
                (k) => (
                  <Link
                    key={k}
                    href={`/?search=${k}#catalog-section`}
                    onClick={() => setSearchModalOpen(false)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-amber-300 border border-white/10 transition-colors"
                  >
                    {k}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
