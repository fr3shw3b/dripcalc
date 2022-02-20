import {
  Dialog,
  Classes,
  Button,
  FormGroup,
  HTMLSelect,
  Intent,
} from "@blueprintjs/core";
import { TimePicker } from "@blueprintjs/datetime";
import moment, { Moment } from "moment";
import { nanoid } from "nanoid";
import React, { useEffect, useState } from "react";

import useMobileCheck from "../../hooks/use-mobile-check";
import { GardenDayEarnings } from "../../store/middleware/shared-calculator-types";
import {
  GardenDayAction,
  GardenDayActionValue,
} from "../../store/reducers/plans";

import "./garden-day-schedule.css";

export type GardenValuesInEditor = {
  dripBUSDLPValue: number;
  plantDripBUSDLPFraction: number;
  averageGardenYieldPercentage: number;
  timestamp: number;
};

type Props = {
  walletName: string;
  walletId: string;
  date?: Moment;
  daySchedule: GardenDayAction[];
  calculatedDayEarnings?: GardenDayEarnings;
  isOpen: boolean;
  onClose: (evt: React.SyntheticEvent<HTMLElement, Event>) => void | undefined;
  onSaveClick: (
    walletId: string,
    date?: Moment,
    daySchedule?: GardenDayAction[]
  ) => void;
};

type LocalGardenDayAction = GardenDayAction & { localId: string };

function GardenDaySchedule({
  isOpen,
  walletName,
  walletId,
  date,
  daySchedule,
  calculatedDayEarnings,
  onClose,
  onSaveClick,
}: Props) {
  const isMobile = useMobileCheck();
  const [mode, setMode] = useState(
    daySchedule.length > 0 ? "custom" : "automatic"
  );

  const [localSchedule, setLocalSchedule] = useState<LocalGardenDayAction[]>(
    deriveLocalSchedule(daySchedule, calculatedDayEarnings)
  );

  useEffect(() => {
    setLocalSchedule((prevState) =>
      deriveLocalSchedule(daySchedule, calculatedDayEarnings, prevState)
    );
  }, [calculatedDayEarnings, daySchedule]);

  useEffect(() => {
    setMode(daySchedule.length > 0 ? "custom" : "automatic");
  }, [daySchedule]);

  const handleSaveClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    onSaveClick(
      walletId,
      date,
      // Only if we are in custom mode do we want the user of this component to save
      // schedule changes.
      mode === "custom"
        ? localSchedule.map((localDayAction) => ({
            action: localDayAction.action,
            timestamp: localDayAction.timestamp,
          }))
        : undefined
    );
  };

  const handleAddActionClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    setLocalSchedule((prevState) => {
      return [
        ...prevState,
        {
          localId: nanoid(),
          action: "sow",
          timestamp: new Date().getTime(),
        },
      ];
    });
  };

  const handleDeleteActionClick: (localId: string) => React.MouseEventHandler =
    (localId) => (evt) => {
      evt.preventDefault();
      setLocalSchedule((prevState) => {
        return prevState.filter(
          ({ localId: currentLocalId }) => currentLocalId !== localId
        );
      });
    };

  const isDayForAction = !!(
    calculatedDayEarnings?.isHarvestDay || calculatedDayEarnings?.isSowDay
  );

  const handleLocalScheduleActionChange: (
    localId: string
  ) => React.ChangeEventHandler<HTMLSelectElement> = (localId) => (evt) => {
    const newAction = evt.currentTarget.value;
    setLocalSchedule((prevState) => {
      const dayActionIndex = prevState.findIndex(
        ({ localId: currentLocalId }) => currentLocalId === localId
      );

      if (dayActionIndex === -1) {
        return prevState;
      }

      return [
        ...prevState.slice(0, dayActionIndex),
        {
          ...prevState[dayActionIndex],
          action: newAction as GardenDayActionValue,
        },
        ...prevState.slice(dayActionIndex + 1),
      ];
    });
  };

  const handleLocalScheduleActionTimeChange: (
    localId: string
  ) => (newDate: Date) => void = (localId) => (newDate) => {
    const newTimestamp = newDate.getTime();
    setLocalSchedule((prevState) => {
      const dayActionIndex = prevState.findIndex(
        ({ localId: currentLocalId }) => currentLocalId === localId
      );

      if (dayActionIndex === -1) {
        return prevState;
      }

      return [
        ...prevState.slice(0, dayActionIndex),
        {
          ...prevState[dayActionIndex],
          timestamp: newTimestamp,
        },
        ...prevState.slice(dayActionIndex + 1),
      ];
    });
  };

  const renderScheduleInputs = () => {
    return (
      <div className="schedule-inputs-outer-container">
        <div className="schedule-inputs-inner-container">
          {localSchedule.map((dayAction) => {
            return (
              <FormGroup
                key={dayAction.localId}
                helperText={
                  "Choose an action and time to carry it out (24 hour clock)"
                }
              >
                <div className="schedule-inputs-action">
                  <HTMLSelect
                    id={dayAction.localId}
                    value={dayAction.action}
                    onChange={handleLocalScheduleActionChange(
                      dayAction.localId
                    )}
                  >
                    {Object.entries(actionLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </HTMLSelect>
                  <TimePicker
                    value={new Date(dayAction.timestamp)}
                    onChange={handleLocalScheduleActionTimeChange(
                      dayAction.localId
                    )}
                  />
                  <Button
                    icon="trash"
                    className="left-small-margin"
                    intent={Intent.DANGER}
                    onClick={handleDeleteActionClick(dayAction.localId)}
                  />
                </div>
              </FormGroup>
            );
          })}
          <Button
            icon="plus"
            text="Add action"
            onClick={handleAddActionClick}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog
        title={`"${walletName}" day schedule for ${date?.format(
          "dddd Do MMMM YYYY"
        )}`}
        isOpen={isOpen}
        className="bp3-dark"
        onClose={onClose}
        canOutsideClickClose={false}
        style={!isMobile ? { minWidth: 768 } : undefined}
      >
        <form
          className="garden-day-schedule-container"
          onSubmit={(event) => event.preventDefault()}
        >
          <p>
            Provide a custom schedule for the day.{" "}
            <strong>
              Be aware that there are no indications of whether you will have
              earned enough to sow or harvest at the times you provide in this
              view!
            </strong>
          </p>
          <FormGroup
            helperText={
              "Choose the mode to use for the schedule on this day." +
              " It can be one automatically calculated for you or a custom schedule."
            }
            label="Mode"
            labelFor="mode-select"
          >
            <HTMLSelect
              id="mode-select"
              value={mode}
              onChange={(evt) => setMode(evt.currentTarget.value)}
            >
              {Object.entries(modeOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </HTMLSelect>
          </FormGroup>
          {mode === "automatic" && isDayForAction && (
            <ul className="action-list">
              {calculatedDayEarnings?.sowHarvestSchedule.map((dayAction) => {
                return (
                  <li>
                    <strong>
                      <i>{actionLabels[dayAction.action]}</i>
                    </strong>{" "}
                    at{" "}
                    {moment(new Date(dayAction.timestamp)).format("HH:mm:ss")}
                  </li>
                );
              })}
            </ul>
          )}
          {mode === "automatic" && !isDayForAction && (
            <ul className="action-list">
              <li>
                <strong>
                  <i>Leave Seeds to Accumulate</i>
                </strong>
              </li>
            </ul>
          )}
          {mode === "custom" && renderScheduleInputs()}
        </form>

        <DialogFooter
          onClose={onClose}
          canSave={true}
          onSaveClick={handleSaveClick}
        />
      </Dialog>
    </>
  );
}

function DialogFooter(props: {
  onClose: (e: React.SyntheticEvent<HTMLElement, Event>) => void | undefined;
  canSave: boolean;
  onSaveClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div className={Classes.DIALOG_FOOTER}>
      <div className={Classes.DIALOG_FOOTER_ACTIONS}>
        <Button onClick={props.onClose}>Close</Button>
        <Button
          intent="primary"
          disabled={!props.canSave}
          onClick={props.onSaveClick}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

function deriveLocalSchedule(
  daySchedule: GardenDayAction[],
  calculatedDayEarnings?: GardenDayEarnings,
  localSchedule?: LocalGardenDayAction[]
): LocalGardenDayAction[] {
  return (
    daySchedule.length > 0
      ? daySchedule
      : calculatedDayEarnings?.sowHarvestSchedule ?? []
  ).map((sourceDayAction) => ({
    ...sourceDayAction,
    localId:
      localSchedule?.find(
        (localDayAction) =>
          localDayAction.timestamp === sourceDayAction.timestamp
      )?.localId ?? nanoid(),
  }));
}

const modeOptions = {
  automatic: "Automatic",
  custom: "Custom Day Schedule",
};

const actionLabels = {
  sow: "Sow",
  harvest: "Harvest",
} as const;

export default GardenDaySchedule;
