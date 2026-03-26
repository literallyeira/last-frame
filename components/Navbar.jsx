'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center' }}>
        <img src="/logo.png" alt="Last Frame Studio" style={{ height: '40px', width: 'auto' }} />
      </Link>

      <button
        className="navbar-hamburger"
        onClick={() => setOpen(!open)}
        aria-label="Menü"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul className={`navbar-links${open ? ' open' : ''}`}>
        <li>
          <Link href="/portfolio" onClick={() => setOpen(false)}>
            Portföy
          </Link>
        </li>
        <li>
          <Link href="/#galeri" onClick={() => setOpen(false)}>
            Galeri
          </Link>
        </li>
        <li>
          <a href="#duzenleme" onClick={() => setOpen(false)}>
            Düzenleme
          </a>
        </li>
        <li>
          <a href="#iletisim" onClick={() => setOpen(false)}>
            İletişim
          </a>
        </li>
      </ul>
    </nav>
  );
}
