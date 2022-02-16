import { createContext } from "react";

export type FeatureToggles = {
  gardenCalculator: boolean;
};

export function featureToggles(): FeatureToggles {
  return {
    gardenCalculator: ["1", "true"].includes(
      process.env.REACT_APP_FEATURE_TOGGLE_GARDEN_CALCULATOR ?? ""
    ),
  };
}

export default createContext(featureToggles());
