import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.08,
      ease: 'easeIn',
    },
  },
};

/**
 * Wraps page content with a fast fade transition.
 * Uses popLayout mode in parent AnimatePresence so the
 * exiting page is removed from flow immediately.
 */
const PageTransition = ({ children, className }: PageTransitionProps) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className={className}
  >
    {children}
  </motion.div>
);

export default PageTransition;
