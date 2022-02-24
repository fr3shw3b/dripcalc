import { useEffect, useState } from "react";

function useScreenSizeCheck(
  lessThanOrEqualThresholdBreakpoint: number
): boolean {
  const [mQuery, setMQuery] = useState({
    matches: window.innerWidth <= lessThanOrEqualThresholdBreakpoint,
  });
  useEffect(() => {
    let mediaQueryList = window.matchMedia(
      `(max-width: ${lessThanOrEqualThresholdBreakpoint}px)`
    );
    const listener = (e: MediaQueryListEvent) => {
      setMQuery(e);
    };
    mediaQueryList.addEventListener("change", listener);
    return () => mediaQueryList.removeEventListener("change", listener);
  }, []);
  return mQuery.matches;
}

export default useScreenSizeCheck;
