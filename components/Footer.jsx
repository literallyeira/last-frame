export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-bottom">
        <p>
          © {year} <a href="#">Last Frame Studio</a>. Tüm hakları saklıdır.
        </p>
        <div className="footer-gtaw">
          <img 
            src="https://forum-tr.gta.world/uploads/monthly_2025_02/logo.png.3fe10156c1213bdb8f59cd9bc9e15781.png" 
            alt="GTAW TR" 
            className="footer-gtaw-logo"
          />
        </div>
      </div>
      <div className="footer-disclaimer">
        (( Bu site resmi bir GTA World web sitesi değildir. Üçüncü taraf bir yazılımdır. ))
      </div>
    </footer>
  );
}
