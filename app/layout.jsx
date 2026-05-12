// app/layout.jsx
export const metadata = {
  title: "TicketForge Dashboard",
  description: "Kelola sistem ticket Discord servermu",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0, background: "#0a0b0f" }}>
        {children}
      </body>
    </html>
  );
}
