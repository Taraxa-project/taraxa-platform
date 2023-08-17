import { useEffect, useRef } from 'react';

export function useInterval(callback: any, delay: number) {
  const savedCallback = useRef<any>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    function trigger() {
      if (
        savedCallback.current ||
        typeof savedCallback.current === 'function'
      ) {
        savedCallback.current();
      }
    }
    if (delay !== null) {
      const id = setInterval(trigger, delay);
      return () => {
        clearInterval(id);
      };
    }
  }, [callback, delay]);
}
