import { motion } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';

interface CollaborativeCursorProps {
  x: number;
  y: number;
  name: string;
  color: string;
  userId: string;
}

const CollaborativeCursor = ({ x, y, name, color, userId }: CollaborativeCursorProps) => {
  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      initial={{ x, y }}
      animate={{ x, y }}
      transition={{ type: "spring", damping: 30, stiffness: 200 }}
      style={{ left: 0, top: 0 }}
    >
      <div className="relative">
        <MousePointer2 
          className="w-5 h-5" 
          style={{ color }}
          fill={color}
        />
        <div 
          className="absolute left-6 top-0 px-2 py-1 rounded text-xs font-medium whitespace-nowrap text-white shadow-lg"
          style={{ backgroundColor: color }}
        >
          {name}
        </div>
      </div>
    </motion.div>
  );
};

export default CollaborativeCursor;
