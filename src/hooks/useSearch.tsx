
import { useEffect, useCallback } from "react";

const useSearch = (effect: any, dependencies: any, delay: number = 500) => {
  const callback = useCallback(effect, dependencies);

  useEffect(() => {
    const timeout = setTimeout(callback, delay);
    return () => clearTimeout(timeout);
  }, [callback, delay]);
};

export default useSearch;
