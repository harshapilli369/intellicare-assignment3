import { useEffect, useState } from 'react';

// Holds a value back until it has stopped changing for `delay` milliseconds.
// Used so that typing a name issues one request rather than one per keystroke.
const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default useDebounce;
