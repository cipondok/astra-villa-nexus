import { useState, useEffect, useCallback } from "react";

interface Position {
  x: number;
  y: number;
}

interface UseDraggablePositionProps {
  defaultPosition?: Position;
  storageKey?: string;
  bounds?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };
}

/**
 * Hook to manage draggable element position with localStorage persistence
 */
export const useDraggablePosition = ({
  defaultPosition = { x: 24, y: 24 }, // 24px = 1.5rem (6 in Tailwind)
  storageKey = "chatbot-position",
  bounds = {}
}: UseDraggablePositionProps = {}) => {
  const [position, setPosition] = useState<Position>(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });

  // Load position from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPosition(parsed);
      } catch {
        // Invalid saved data, use default
      }
    }
  }, [storageKey]);

  // Save position to localStorage
  const savePosition = useCallback((pos: Position) => {
    localStorage.setItem(storageKey, JSON.stringify(pos));
  }, [storageKey]);

  // Constrain position within bounds
  const constrainPosition = useCallback((pos: Position): Position => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const buttonSize = 56; // 14 * 4 = 56px (h-14 w-14)

    return {
      x: Math.max(
        bounds.minX ?? 8,
        Math.min(pos.x, (bounds.maxX ?? viewportWidth) - buttonSize - 8)
      ),
      y: Math.max(
        bounds.minY ?? 8,
        Math.min(pos.y, (bounds.maxY ?? viewportHeight) - buttonSize - 8)
      ),
    };
  }, [bounds]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y,
    });
  }, [position]);

  // Handle drag move
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const newPosition = constrainPosition({
        x: clientX - dragStart.x,
        y: clientY - dragStart.y,
      });

      setPosition(newPosition);
    };

    const handleEnd = () => {
      setIsDragging(false);
      savePosition(position);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragStart, constrainPosition, savePosition, position]);

  // Reset to default position
  const resetPosition = useCallback(() => {
    setPosition(defaultPosition);
    savePosition(defaultPosition);
  }, [defaultPosition, savePosition]);

  return {
    position,
    isDragging,
    handleDragStart,
    resetPosition,
  };
};
