import { createContext } from "react";

export type FeatureToggles = {
  gardenCalculator: boolean;
  dripFiatModeToggle: boolean;
};

export function featureToggles(): FeatureToggles {
  return {
    gardenCalculator: ["1", "true"].includes(
      process.env.REACT_APP_FEATURE_TOGGLE_GARDEN_CALCULATOR ?? ""
    ),
    dripFiatModeToggle: ["1", "true"].includes(
      process.env.REACT_APP_FEATURE_TOGGLE_DRIP_FIAT_MODE_SWITCH ?? ""
    ),
  };
}

export default createContext(featureToggles());
