import "./globals.css";

export const metadata = {
  title: "Last Frame Studio | Profesyonel Fotoğraf Hizmetleri",
  description:
    "Last Frame Studio — Fotoğraf galerisi, düzenleme ve destek hizmetleri. Anılarınızı en güzel haliyle saklayın.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
