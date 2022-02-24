import useScreenSizeCheck from "./use-screen-size-check";

function useMobileCheck(): boolean {
  return useScreenSizeCheck(768);
}

export default useMobileCheck;
