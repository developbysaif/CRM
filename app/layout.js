import './globals.css';

export const metadata = {
  title: 'LeadAI Pro — Enterprise SaaS CRM Platform',
  description: 'Enterprise AI-powered lead generation, CRM, outreach, and contract automation platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
