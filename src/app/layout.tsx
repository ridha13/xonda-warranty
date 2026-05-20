import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata = { title: 'زوندا', description: 'نظام إدارة الضمانات' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
