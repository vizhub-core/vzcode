import { useState, useEffect } from 'react';

export const useDimensions = (containerRef) => {
  const [dimensions, setDimensions] = useState(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const resizeObserver = new ResizeObserver(() => {
      setDimensions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    });
    
    resizeObserver.observe(container);
    
    // Cleanup function
    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);
  
  return dimensions;
};