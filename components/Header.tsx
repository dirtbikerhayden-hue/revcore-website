'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Home', href: '/' },
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'Lead Generation', href: '/services#leads' },
      { label: 'Organic Growth', href: '/services#organic' },
      { label: 'Smart Automation', href: '/services#automation' },
      { label: 'Sales Training', href: '/services#training' },
      { label: 'Sales Software', href: '/services#software' },
    ],
  },
  {
    label: 'Software',
    href: '/software',
    children: [
      { label: 'Quoting Software', href: '/software#quoting' },
      { label: 'Presentation Software', href: '/software#presentation' },
    ],
  },
  { label: 'Results', href: '/portfolio' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Client Portal', href: '/portal' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const isTracker = pathname?.startsWith('/tracker');

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: '#ffffff',
      borderBottom: '1px solid #f0f0f0',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        height: '80px',
        padding: '0 clamp(1.5rem, 4vw, 4rem)',
        gap: '2rem',
        maxWidth: '100%',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="https://assets.cdn.filesafe.space/NYlSya2nYSkSnnXEbY2l/media/69a9af9fb003fa7bb8bb92ee.png" alt="RevCore" style={{ height: '32px', width: 'auto' }} />
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#0A0A0A' }}>
            RevCore{isTracker && <span style={{ color: '#FE6462', marginLeft: '5px' }}>Tracker</span>}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(3rem, 6vw, 8rem)' }} className="hidden-mobile">
          {navLinks.map((link) => (
            <div
              key={link.label}
              style={{ position: 'relative' }}
              onMouseEnter={() => link.children && setActiveDropdown(link.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href={link.href}
                style={{
                  textDecoration: 'none',
                  color: '#0A0A0A',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {link.label}
                {link.children && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </Link>

              {link.children && activeDropdown === link.label && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  paddingTop: '14px',
                }}>
                <div style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '8px',
                  minWidth: '180px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  border: '1px solid #f0f0f0',
                }}>
                  {link.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      style={{
                        display: 'block',
                        padding: '9px 14px',
                        textDecoration: 'none',
                        color: '#0A0A0A',
                        fontSize: '0.875rem',
                        borderRadius: '8px',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Book a call CTA + mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/contact"
            className="hidden-mobile"
            style={{
              display: 'inline-flex', alignItems: 'center',
              background: '#0A0A0A', color: 'white',
              padding: '9px 20px', borderRadius: '100px',
              fontSize: '0.85rem', fontWeight: 700,
              textDecoration: 'none', whiteSpace: 'nowrap',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.82')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Book a call
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0A0A0A', display: 'none', padding: '4px' }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div style={{ background: '#ffffff', borderTop: '1px solid #f0f0f0', padding: '1.5rem' }}>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{ display: 'block', padding: '12px 0', textDecoration: 'none', color: '#0A0A0A', fontSize: '1rem', fontWeight: 500, borderBottom: '1px solid #f0f0f0' }}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/contact" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '12px 0', textDecoration: 'none', color: '#0A0A0A', fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid #f0f0f0' }}>
            Book a Call
          </Link>
          <a href="mailto:hello@revcorehq.com" style={{ display: 'block', padding: '12px 0', textDecoration: 'none', color: '#6B6B6B', fontSize: '0.9rem' }}>
            hello@revcorehq.com
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
