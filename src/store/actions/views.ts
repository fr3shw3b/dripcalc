import { Action } from "redux";

export const SHOW_OVERVIEW = "SHOW_OVERVIEW";
export type ShowOverviewAction = Action<typeof SHOW_OVERVIEW>;

export const SHOW_WALLETS = "SHOW_WALLETS";
export type ShowWalletsAction = Action<typeof SHOW_WALLETS>;

export const SHOW_SETTINGS_PANEL = "SHOW_SETTINGS_PANEL";
export type ShowSettingsPanelAction = Action<typeof SHOW_SETTINGS_PANEL>;

export const HIDE_SETTINGS_PANEL = "HIDE_SETTINGS_PANEL";
export type HideSettingsPanelAction = Action<typeof HIDE_SETTINGS_PANEL>;

export function showOverview(): ShowOverviewAction {
  return {
    type: SHOW_OVERVIEW,
  };
}

export function showWallets(): ShowWalletsAction {
  return {
    type: SHOW_WALLETS,
  };
}

export function showSettingsPanel(): ShowSettingsPanelAction {
  return {
    type: SHOW_SETTINGS_PANEL,
  };
}

export function hideSettingsPanel(): HideSettingsPanelAction {
  return {
    type: HIDE_SETTINGS_PANEL,
  };
}
