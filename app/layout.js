import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata = {
  title: {
    default: 'LeadAI Pro — Enterprise SaaS CRM',
    template: '%s · LeadAI Pro',
  },
  description: 'Enterprise AI-powered lead generation, CRM, outreach, and contract automation platform',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('crm_theme');
                  // Always default to clean white theme
                  if (!saved || saved === 'dark') {
                    saved = 'light';
                    localStorage.setItem('crm_theme', 'light');
                  }
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
