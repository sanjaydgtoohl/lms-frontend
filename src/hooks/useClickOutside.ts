import { useEffect, type RefObject } from 'react';

export function useClickOutside(
  refs: Array<RefObject<HTMLElement | null>>,
  active: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!active) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const clickedInside = refs.some((ref) => ref.current?.contains(target));
      if (!clickedInside) onClose();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [active, onClose, refs]);
}
