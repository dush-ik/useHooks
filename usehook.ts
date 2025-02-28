import { useRef, useEffect, useState, useCallback, EffectCallback, DependencyList } from 'react';

export function useTimeout(callback: () => void, delay: number) {
  const callBackRef = useRef(callback);
  callBackRef.current = callback;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      callBackRef.current()
    }, delay);
    return () => clearTimeout(timer);
  }, [delay])
}

export function useIsFirstRender (): boolean {
  const value = useRef(true);
  if(value.current) {
    value.current = false;
    return true;
  }
  return false;
}

export function usePrevious<T>(value: T): T | undefined {
  const prev = useRef<T | undefined>(undefined);
  let prevValue = prev.current;
  if (prev.current !== value) {
    prev.current = value;
  }
  return prevValue;
}

export function useClickOutside<T extends HTMLElement>(callback: () => void):React.RefObject<T | null> {
  const domRef = useRef<T>(null)
  const callMe = useCallback((e: Event) => {
    if(domRef.current && e.target && !domRef.current.contains(e.target as Node)) {
      callback();
    }
  }, [])

  useEffect(() => {
    document.addEventListener('click', callMe, false)
    return () => document.removeEventListener('click', callMe)
  }, [])
  return domRef;
}

export function useIsMounted(): () => boolean {
  const mountedRef = useRef<boolean>(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    }
  }, [])
  return () => mountedRef.current;
}

export function useEffectOnce(effect: EffectCallback) {
  useEffect(() => {
    const cleanup = effect();
    return () => {
      if (cleanup) cleanup();
    }
  }, [])
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedVal, setDebouncedVal] = useState(value);
  useEffect(() =>{
    const timer = setTimeout(() => setDebouncedVal(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay])
  return debouncedVal;
}


export function useHover<T extends HTMLElement>(): [React.Ref<T>, boolean] {
  const domRef = useRef<T>(null)
  const [isHovered, setHovered] = useState(false);
  const callMe = useCallback((e: Event) => {
    if(domRef.current && e.target) {
      if (domRef.current.contains(e.target as Node)) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mouseover', callMe, false)
    return () => document.removeEventListener('mouseover', callMe)
  }, [domRef.current])
  return [domRef, isHovered];
}


export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList) {
  const cleanupRef = useRef<any>(null);
  const prevDepsRef = useRef<DependencyList | undefined>(deps);
  const isMountedRef = useRef(false);

  const hasChnaged = (prevDeps?: DependencyList, newDeps?: DependencyList) => {
    if(!prevDeps || !newDeps) return true;
    return prevDeps.some((dep, index) => dep !== newDeps[index]);
  }

  if (isMountedRef.current) {
    if (hasChnaged(prevDepsRef.current, deps)) {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      cleanupRef.current = effect();
    }
  } else {
    isMountedRef.current = true;
    cleanupRef.current = effect();
  }

  prevDepsRef.current = deps;

  return () => {
    if(cleanupRef.current) {
      cleanupRef.current();
    }
  }
}
