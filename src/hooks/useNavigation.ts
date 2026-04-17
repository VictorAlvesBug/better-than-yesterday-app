import { Href, usePathname, useRouter } from 'expo-router';

export default function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  return {
    back: router.back,
    push: (path: Href, forceReload?: boolean) => {
      if (!forceReload
        && typeof path === 'string' 
        && path === pathname) 
        return;
        router.push(path);
    },
    replace: (path: Href, forceReload?: boolean) => {
      if (!forceReload
        && typeof path === 'string' 
        && path === pathname) 
        return;
      router.replace(path);
    },
  };
}