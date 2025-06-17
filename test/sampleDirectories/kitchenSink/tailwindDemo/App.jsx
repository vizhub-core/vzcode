import React, { useState } from 'react';

const App = () => {
  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-center mb-6 text-primary">Counter App</h1>
        
        <div className="text-8xl font-bold text-center mb-8 text-secondary">
          {count}
        </div>
        
        <div className="flex gap-4 justify-center">
          <button 
            onClick={decrement}
            className="px-6 py-3 bg-danger text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
          >
            Decrease
          </button>
          
          <button 
            onClick={reset}
            className="px-6 py-3 bg-accent text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Reset
          </button>
          
          <button 
            onClick={increment}
            className="px-6 py-3 bg-success text-white font-bold rounded-lg hover:bg-green-600 transition-colors"
          >
            Increase
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;