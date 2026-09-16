import React, { forwardRef } from 'react';

const elementCache: Record<string, any> = {};

export const motion = new Proxy({} as any, {
  get: (_, prop: string) => {
    if (!elementCache[prop]) {
      elementCache[prop] = forwardRef<any, any>(({ initial, animate, exit, transition, whileHover, whileTap, layout, layoutId, ...props }, ref) => {
        return React.createElement(prop, { ref, ...props });
      });
      elementCache[prop].displayName = `motion.${prop}`;
    }
    return elementCache[prop];
  }
});

export const AnimatePresence: React.FC<{ children?: React.ReactNode; mode?: string }> = ({ children }) => {
  return <>{children}</>;
};

export default motion;
