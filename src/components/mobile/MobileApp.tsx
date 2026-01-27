import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import MobileFirstNavigation from './MobileFirstNavigation';
import ThumbZoneLayout from './ThumbZoneLayout';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Mobile App Shell
 * Wraps the entire mobile experience with:
 * - Thumb-zone optimized navigation
 * - Progressive loading
 * - Offline-first architecture
 */

// Critical pages - load immediately
import Index from '@/pages/Index';
import Search from '@/pages/Search';
import PropertyDetail from '@/pages/PropertyDetail';

// Lazy load non-critical pages
const Saved = lazy(() => import('@/pages/Saved'));
const Profile = lazy(() => import('@/pages/Profile'));
const Auth = lazy(() => import('@/pages/Auth'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const AddProperty = lazy(() => import('@/pages/AddProperty'));

const MobileLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

const MobileApp: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      {/* Main content with bottom padding for nav */}
      <Suspense fallback={<MobileLoader />}>
        <Routes>
          {/* Core flows optimized for 5-tap max */}
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<Search />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/add-property" element={user ? <AddProperty /> : <Navigate to="/auth" />} />
          
          {/* Redirect common paths */}
          <Route path="/dijual" element={<Navigate to="/search?type=sale" />} />
          <Route path="/disewa" element={<Navigate to="/search?type=rent" />} />
          <Route path="/buy" element={<Navigate to="/search?type=sale" />} />
          <Route path="/rent" element={<Navigate to="/search?type=rent" />} />
        </Routes>
      </Suspense>

      {/* Bottom navigation - always visible */}
      <MobileFirstNavigation />
    </div>
  );
};

export default MobileApp;
