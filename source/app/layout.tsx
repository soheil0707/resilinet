import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/auth-context';
import { WorkflowProvider } from '@/lib/workflow/workflow-context';

export const metadata: Metadata = {
  title: 'ResiliNet — AI-Powered Supply Chain Crisis Orchestrator',
  description:
    'SAP Hackfest 2026 enterprise supply chain resilience platform for Astra Motors Manufacturing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 antialiased flex flex-col">
        <AuthProvider>
          <WorkflowProvider>{children}</WorkflowProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
