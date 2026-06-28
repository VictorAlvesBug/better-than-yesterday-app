import { Href, usePathname, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';

export default function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const back = useCallback(() => {
    router.back();
  }, [router]);

  const push = useCallback((path: Href, forceReload?: boolean) => {
    if (!forceReload && typeof path === 'string' && path === pathname)
      return;

    router.push(path);
  }, [router, pathname]);

  const replace = useCallback((path: Href, forceReload?: boolean) => {
    if (!forceReload && typeof path === 'string' && path === pathname)
      return;

    router.replace(path);
  }, [router, pathname]);

  return useMemo(
    () => ({ back, push, replace }),
    [back, push, replace]
  );
}
