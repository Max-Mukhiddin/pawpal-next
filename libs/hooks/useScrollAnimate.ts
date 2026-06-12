import { useEffect, useRef } from 'react';

export function useScrollAnimate<T extends HTMLElement>(
  onEnter: (el: T) => void,
  threshold = 0.12,
) {
  const ref = useRef<T>(null);
  const onEnterRef = useRef(onEnter);
  onEnterRef.current = onEnter;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add('animation-ready');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onEnterRef.current(el);
          observer.unobserve(el);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
