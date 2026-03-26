export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>
        © {year} <a href="#">Last Frame Studio</a>. Tüm hakları saklıdır.
      </p>
    </footer>
  );
}
