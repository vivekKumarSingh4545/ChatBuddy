import { useState, useRef, useCallback, useEffect } from "react";

/**
 * useDraggable – makes a fixed-position panel draggable.
 *
 * Returns { elementRef, dragHandleProps, style }
 *   • elementRef   – attach to the panel's root element
 *   • dragHandleProps – spread onto whatever element should trigger dragging
 *   • style        – spread as the `style` prop on the panel root
 */
export default function useDraggable({ initialX, initialY } = {}) {
  // Start centred if no initial position given
  const [pos, setPos] = useState({ x: initialX ?? null, y: initialY ?? null });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const elementRef = useRef(null);

  // Centre the panel on first mount (when pos is null)
  useEffect(() => {
    if (pos.x === null && elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setPos({
        x: (window.innerWidth - rect.width) / 2,
        y: (window.innerHeight - rect.height) / 2,
      });
    }
  }, [pos.x]);

  const onMouseDown = useCallback((e) => {
    // Only primary button
    if (e.button !== 0) return;
    dragging.current = true;

    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      offset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    e.preventDefault();
  }, []);

  const onTouchStart = useCallback((e) => {
    dragging.current = true;
    const touch = e.touches[0];
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      offset.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
  }, []);

  useEffect(() => {
    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

    const move = (clientX, clientY) => {
      if (!dragging.current || !elementRef.current) return;
      const rect = elementRef.current.getBoundingClientRect();
      setPos({
        x: clamp(clientX - offset.current.x, 0, window.innerWidth - rect.width),
        y: clamp(clientY - offset.current.y, 0, window.innerHeight - rect.height),
      });
    };

    const onMouseMove = (e) => move(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      const t = e.touches[0];
      move(t.clientX, t.clientY);
    };
    const stop = () => { dragging.current = false; };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", stop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stop);
    };
  }, []);

  const style =
    pos.x !== null
      ? { position: "fixed", left: pos.x, top: pos.y, transform: "none" }
      : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  const dragHandleProps = {
    onMouseDown,
    onTouchStart,
    style: { cursor: "grab" },
  };

  return { elementRef, dragHandleProps, style };
}
