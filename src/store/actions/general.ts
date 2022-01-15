import { FSA } from "../types";

export const REMOVE_NOTIFICATION = "REMOVE_NOTIFICATION";
export type RemoveNotificationAction = FSA<
  typeof REMOVE_NOTIFICATION,
  {},
  {
    id: string;
  }
>;

export function removeNotification(id: string): RemoveNotificationAction {
  return {
    type: REMOVE_NOTIFICATION,
    payload: {
      id,
    },
    meta: {},
  };
}
