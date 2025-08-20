'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { isAuthenticated } from '@/lib/auth';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const publicRoutes = ['/login', '/register', '/verify-otp', '/login-verify'];

export default function Layout({ children }: LayoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Small delay to ensure localStorage is available
    const timer = setTimeout(() => {
      const isPublicRoute = publicRoutes.includes(pathname);
      const userAuthenticated = isAuthenticated();

      if (!isPublicRoute && !userAuthenticated) {
        router.push('/login');
      } else if (isPublicRoute && userAuthenticated && pathname !== '/verify-otp' && pathname !== '/login-verify') {
        router.push('/dashboard');
      }
      
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, router]);

  // Show loading spinner during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isPublicRoute = publicRoutes.includes(pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {!isPublicRoute && <Navbar />}
      <main className={isPublicRoute ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {children}
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}