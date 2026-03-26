'use client';

import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <a href="#" className="navbar-logo">
        Last Frame <span>Studio</span>
      </a>

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
          <a href="#portfolio" onClick={() => setOpen(false)}>
            Portföy
          </a>
        </li>
        <li>
          <a href="#galeri" onClick={() => setOpen(false)}>
            Galeri
          </a>
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
