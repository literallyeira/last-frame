'use client';

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import PhotoRequestForm from '@/components/PhotoRequestForm';
import EditingRequestForm from '@/components/EditingRequestForm';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';

export default function Home() {
  useEffect(() => {
    /* ===== Reveal on scroll ===== */
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );
    revealElements.forEach((el) => revealObserver.observe(el));

    /* ===== Parallax on scroll ===== */
    const parallaxItems = document.querySelectorAll('.parallax-divider-inner');
    const heroContent = document.querySelector('.hero-content');
    const heroPortfolio = document.querySelector('.hero-portfolio-grid');

    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Hero parallax
      if (heroContent) {
        heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
        heroContent.style.opacity = Math.max(1 - scrollY / 600, 0);
      }
      
      if (heroPortfolio) {
        heroPortfolio.style.transform = `translateY(${scrollY * 0.15}px)`;
      }

      // Divider text parallax
      parallaxItems.forEach((item) => {
        const rect = item.parentElement.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const offset = (center - window.innerHeight / 2) * 0.15;
        item.style.transform = `translateX(${offset}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      revealObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <Navbar />
      <Hero />

      {/* Marquee divider */}
      <div className="marquee-divider">
        <div className="marquee-track">
          <span>CAPTURE &nbsp; · &nbsp; CREATE &nbsp; · &nbsp; DELIVER &nbsp; · &nbsp; CAPTURE &nbsp; · &nbsp; CREATE &nbsp; · &nbsp; DELIVER &nbsp; · &nbsp;</span>
          <span>CAPTURE &nbsp; · &nbsp; CREATE &nbsp; · &nbsp; DELIVER &nbsp; · &nbsp; CAPTURE &nbsp; · &nbsp; CREATE &nbsp; · &nbsp; DELIVER &nbsp; · &nbsp;</span>
        </div>
      </div>

      <PhotoRequestForm />

      {/* Marquee divider */}
      <div className="marquee-divider">
        <div className="marquee-track">
          <span>EDIT &nbsp; · &nbsp; ENHANCE &nbsp; · &nbsp; TRANSFORM &nbsp; · &nbsp; EDIT &nbsp; · &nbsp; ENHANCE &nbsp; · &nbsp; TRANSFORM &nbsp; · &nbsp;</span>
          <span>EDIT &nbsp; · &nbsp; ENHANCE &nbsp; · &nbsp; TRANSFORM &nbsp; · &nbsp; EDIT &nbsp; · &nbsp; ENHANCE &nbsp; · &nbsp; TRANSFORM &nbsp; · &nbsp;</span>
        </div>
      </div>

      <EditingRequestForm />

      {/* Marquee divider */}
      <div className="marquee-divider">
        <div className="marquee-track">
          <span>CONNECT &nbsp; · &nbsp; COLLABORATE &nbsp; · &nbsp; INSPIRE &nbsp; · &nbsp; CONNECT &nbsp; · &nbsp; COLLABORATE &nbsp; · &nbsp; INSPIRE &nbsp; · &nbsp;</span>
          <span>CONNECT &nbsp; · &nbsp; COLLABORATE &nbsp; · &nbsp; INSPIRE &nbsp; · &nbsp; CONNECT &nbsp; · &nbsp; COLLABORATE &nbsp; · &nbsp; INSPIRE &nbsp; · &nbsp;</span>
        </div>
      </div>

      <ContactForm />
      <Footer />
    </>
  );
}
