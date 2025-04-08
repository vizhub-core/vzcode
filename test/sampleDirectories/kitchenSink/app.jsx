import React, { useRef, useEffect, useState } from 'react';
import { main } from './main';
import { useDimensions } from './useDimensions';

const App = () => {
  const ref = useRef(null);
  const [state, setState] = useState({});
  const dimensions = useDimensions(ref);
  
  useEffect(() => {
    if (!ref.current || !dimensions) return;
    
    // Update state with dimensions
    setState(prevState => ({
      ...prevState,
      dimensions
    }));
  }, [dimensions]);

  useEffect(() => {
    if (!ref.current) return;
    return main(ref.current, { state, setState });
  }, [state]);

  return <div id="viz-container" ref={ref} />;
};

export default App;