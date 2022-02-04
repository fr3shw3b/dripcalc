import { useEffect, useState } from "react";

function useMobileCheck(): boolean {
  const [mQuery, setMQuery] = useState({
    matches: window.innerWidth <= 768,
  });
  useEffect(() => {
    let mediaQueryList = window.matchMedia("(max-width: 768px)");
    const listener = (e: MediaQueryListEvent) => {
      setMQuery(e);
    };
    mediaQueryList.addEventListener("change", listener);
    return () => mediaQueryList.removeEventListener("change", listener);
  }, []);
  return mQuery.matches;
}

export default useMobileCheck;
