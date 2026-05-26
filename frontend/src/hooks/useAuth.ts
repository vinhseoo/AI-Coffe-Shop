import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

export function useAuth(requireAuth = false, allowedRoles?: ('OWNER' | 'STAFF')[]) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, isAuthenticated, logout } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Zustand persist event listeners to monitor state loading
    const unsubHydrate = useAuthStore.persist.onHydrate(() => setIsHydrated(false));
    const unsubFinishHydration = useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));

    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return () => {
      unsubHydrate();
      unsubFinishHydration();
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (requireAuth && !isAuthenticated) {
      // Redirect to login page and preserve target path in query params
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (requireAuth && isAuthenticated && allowedRoles && user) {
      // Role-Based Access Control (RBAC) redirection if user lacks required permissions
      if (!allowedRoles.includes(user.role)) {
        router.push('/dashboard?error=unauthorized');
      }
    }
  }, [isHydrated, isAuthenticated, user, requireAuth, allowedRoles, router, pathname]);

  return {
    user,
    token,
    isAuthenticated,
    logout,
    isLoading: !isHydrated,
  };
}
