import React, { ReactNode, Children } from 'react';
import ScrollReveal from './ScrollReveal';

interface StaggeredRevealProps {
  children: ReactNode;
  /** Base delay between each child in ms */
  staggerDelay?: number;
  /** Direction of reveal animation */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Additional className on wrapper */
  className?: string;
}

/**
 * Wraps each child in a ScrollReveal with incremental delay
 * for a staggered cascade reveal effect.
 */
const StaggeredReveal: React.FC<StaggeredRevealProps> = ({
  children,
  staggerDelay = 100,
  direction = 'up',
  className,
}) => {
  const childArray = Children.toArray(children);

  return (
    <div className={className}>
      {childArray.map((child, index) => (
        <ScrollReveal
          key={index}
          direction={direction}
          delay={index * staggerDelay}
          duration={500}
          distance={20}
        >
          {child}
        </ScrollReveal>
      ))}
    </div>
  );
};

export default StaggeredReveal;
