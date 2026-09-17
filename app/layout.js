import './globals.css';

export const metadata = {
  title: 'LeadAI Pro — Headless CRM API Server',
  description: 'Enterprise-grade REST API backend for lead discovery, scoring, outreach, and contract automation',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ margin: 0, padding: 0, background: '#090d16' }}>
        {children}
      </body>
    </html>
  );
}
