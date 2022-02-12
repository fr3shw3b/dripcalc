import { Action } from "redux";

export const SHOW_OVERVIEW = "SHOW_OVERVIEW";
export type ShowOverviewAction = Action<typeof SHOW_OVERVIEW> & {
  planId: string;
};

export const SHOW_WALLETS = "SHOW_WALLETS";
export type ShowWalletsAction = Action<typeof SHOW_WALLETS> & {
  planId: string;
};

export const SHOW_GARDEN_OVERVIEW = "SHOW_GARDEN_OVERVIEW";
export type ShowGardenOverviewAction = Action<typeof SHOW_GARDEN_OVERVIEW> & {
  planId: string;
};

export const SHOW_GARDEN_PLAN = "SHOW_GARDEN_PLAN";
export type ShowGardenPlanAction = Action<typeof SHOW_GARDEN_PLAN> & {
  planId: string;
};

export const SHOW_SETTINGS_PANEL = "SHOW_SETTINGS_PANEL";
export type ShowSettingsPanelAction = Action<typeof SHOW_SETTINGS_PANEL> & {
  planId: string;
};

export const HIDE_SETTINGS_PANEL = "HIDE_SETTINGS_PANEL";
export type HideSettingsPanelAction = Action<typeof HIDE_SETTINGS_PANEL> & {
  planId: string;
};

export function showOverview(planId: string): ShowOverviewAction {
  return {
    type: SHOW_OVERVIEW,
    planId,
  };
}

export function showWallets(planId: string): ShowWalletsAction {
  return {
    type: SHOW_WALLETS,
    planId,
  };
}

export function showSettingsPanel(planId: string): ShowSettingsPanelAction {
  return {
    type: SHOW_SETTINGS_PANEL,
    planId,
  };
}

export function hideSettingsPanel(planId: string): HideSettingsPanelAction {
  return {
    type: HIDE_SETTINGS_PANEL,
    planId,
  };
}

export function showGardenOverview(planId: string): ShowGardenOverviewAction {
  return {
    type: SHOW_GARDEN_OVERVIEW,
    planId,
  };
}

export function showGardenPlan(planId: string): ShowGardenPlanAction {
  return {
    type: SHOW_GARDEN_PLAN,
    planId,
  };
}
