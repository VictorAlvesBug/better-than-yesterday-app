import { DependencyList, useEffect } from 'react';

type Cleanup = () => void;
type AsyncEffect = () => Promise<void | Cleanup>;

export default function useEffectAsync(
  effect: AsyncEffect,
  deps?: DependencyList
): void {
  useEffect(() => {
    let cleanup: Cleanup | undefined;

    void effect().then((returnedCleanup) => {
      cleanup = returnedCleanup ?? undefined;
    });

    return () => {
      cleanup?.();
    };
  }, deps);
}