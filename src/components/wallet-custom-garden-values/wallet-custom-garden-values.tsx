import { Dialog, Classes, Button, Intent } from "@blueprintjs/core";
import { Cell, Column, EditableCell2, Table2 } from "@blueprintjs/table";
import React, { useContext, useState } from "react";

import moment from "moment";
import { useSelector } from "react-redux";

import { AppState } from "../../store/types";
import useMobileCheck from "../../hooks/use-mobile-check";
import ContentContext from "../../contexts/content";
import ConfigContext from "../../contexts/config";
import FeatureTogglesContext from "../../contexts/feature-toggles";

export type GardenValuesInEditor = {
  dripBUSDLPValue: number;
  plantDripBUSDLPFraction: number;
  averageGardenYieldPercentage: number;
  timestamp: number;
};

type Props = {
  walletName: string;
  walletId: string;
  walletStartDate: number;
  gardenValues: GardenValuesInEditor[];
  isOpen: boolean;
  onClose: (evt: React.SyntheticEvent<HTMLElement, Event>) => void | undefined;
  onChangeMonthGardenValues: (
    // Should be treated as a patch where
    // the user of this component will patch changes
    // only for the fields provided.
    values: Partial<GardenValuesInEditor>,
    rowIndex: number
  ) => void;
  onSaveClick: (walletId: string) => void;
  onAddAnotherMonth: () => void;
  onRemoveLastMonth: () => void;
};

function WalletCustomGardenValues({
  isOpen,
  walletName,
  walletId,
  gardenValues,
  onClose,
  onChangeMonthGardenValues,
  onSaveClick,
  onAddAnotherMonth,
  onRemoveLastMonth,
}: Props) {
  const isMobile = useMobileCheck();
  const [
    averageGardenYeildPercentageValidationState,
    setAverageGardenYeildPercentageValidationState,
  ] = useState<Record<string, Intent | null>>({});

  const [showDetails, setShowDetails] = useState(false);
  const { wallets: walletsContent } = useContext(ContentContext);
  const config = useContext(ConfigContext);
  const { currency, fiatModeInState } = useSelector((state: AppState) => {
    const currentPlanId = state.plans.current;
    return {
      ...state.settings[currentPlanId],
      fiatModeInState: state.general.fiatMode,
    };
  });

  const featureToggles = useContext(FeatureTogglesContext);

  const fiatMode =
    (featureToggles.dripFiatModeToggle && fiatModeInState) ||
    !featureToggles.dripFiatModeToggle;

  const handleSaveClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    onSaveClick(walletId);
  };

  const handleAddAnotherMonthClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    onAddAnotherMonth();
  };

  const handleRemoveLastMonthClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    onRemoveLastMonth();
  };

  const handleToggleDetailsClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    setShowDetails((prevState) => !prevState);
  };

  const handleChangeMonthDripBUSDLPValue =
    (rowIndex: number) => (value: string) => {
      onChangeMonthGardenValues(
        { dripBUSDLPValue: Number.parseFloat(value) },
        rowIndex
      );
    };

  const handleChangeMonthPlantDripBUSDLPFraction =
    (rowIndex: number) => (value: string) => {
      onChangeMonthGardenValues(
        { plantDripBUSDLPFraction: Number.parseFloat(value) / 100 },
        rowIndex
      );
    };

  const handleChangeMonthAverageGardenYieldPercentage =
    (rowIndex: number) => (value: string) => {
      onChangeMonthGardenValues(
        { averageGardenYieldPercentage: Number.parseFloat(value) / 100 },
        rowIndex
      );
    };

  const averageGardenYieldPercentageCellValidator = (
    rowIndex: number,
    columnIndex: number
  ) => {
    const dataKey = `${rowIndex}-${columnIndex}`;
    return (value: string) => {
      const intent =
        Number.parseFloat(value) / 100 <= config.maxGardenDailyYieldPercentage
          ? null
          : Intent.DANGER;
      setAverageGardenYeildPercentageValidationState((prevState) => ({
        ...prevState,
        [dataKey]: intent,
      }));
      handleChangeMonthAverageGardenYieldPercentage(rowIndex)(value);
    };
  };

  const renderFiatTable = () => {
    return (
      <Table2 numRows={gardenValues.length}>
        <Column
          name={walletsContent.monthTableColumnLabel}
          cellRenderer={(rowIndex: number) => {
            const { timestamp } = gardenValues[rowIndex];
            return <Cell>{moment(new Date(timestamp)).format("MMMM")}</Cell>;
          }}
        />
        <Column
          name={walletsContent.yearTableColumnLabel}
          cellRenderer={(rowIndex: number) => {
            const { timestamp } = gardenValues[rowIndex];
            return <Cell>{moment(new Date(timestamp)).format("YYYY")}</Cell>;
          }}
        />
        <Column
          name={walletsContent.dripBUSDLPValueColumnLabel(currency)}
          cellRenderer={(rowIndex: number) => {
            const { dripBUSDLPValue } = gardenValues[rowIndex];

            return (
              <EditableCell2
                value={`${dripBUSDLPValue}`}
                onConfirm={handleChangeMonthDripBUSDLPValue(rowIndex)}
              />
            );
          }}
        />
        <Column
          name={walletsContent.plantLPFractionColumnLabel}
          cellRenderer={(rowIndex: number) => {
            const { plantDripBUSDLPFraction } = gardenValues[rowIndex];

            return (
              <EditableCell2
                value={`${plantDripBUSDLPFraction * 100}`}
                onConfirm={handleChangeMonthPlantDripBUSDLPFraction(rowIndex)}
              />
            );
          }}
        />
        <Column
          name={walletsContent.averageGardenDailyYieldColumnLabel}
          cellRenderer={(rowIndex: number, colIndex: number) => {
            const { averageGardenYieldPercentage } = gardenValues[rowIndex];

            return (
              <EditableCell2
                value={`${averageGardenYieldPercentage * 100}`}
                intent={
                  averageGardenYeildPercentageValidationState[
                    `${rowIndex}-${colIndex}`
                  ] ?? Intent.NONE
                }
                onConfirm={averageGardenYieldPercentageCellValidator(
                  rowIndex,
                  colIndex
                )}
                onCancel={averageGardenYieldPercentageCellValidator(
                  rowIndex,
                  colIndex
                )}
              />
            );
          }}
        />
      </Table2>
    );
  };

  // The code duplication here is not ideal but the blueprintjs tables don't allow for conditional columns!
  const renderNonFiatTable = () => {
    return (
      <Table2 numRows={gardenValues.length}>
        <Column
          name={walletsContent.monthTableColumnLabel}
          cellRenderer={(rowIndex: number) => {
            const { timestamp } = gardenValues[rowIndex];
            return <Cell>{moment(new Date(timestamp)).format("MMMM")}</Cell>;
          }}
        />
        <Column
          name={walletsContent.yearTableColumnLabel}
          cellRenderer={(rowIndex: number) => {
            const { timestamp } = gardenValues[rowIndex];
            return <Cell>{moment(new Date(timestamp)).format("YYYY")}</Cell>;
          }}
        />
        <Column
          name={walletsContent.plantLPFractionColumnLabel}
          cellRenderer={(rowIndex: number) => {
            const { plantDripBUSDLPFraction } = gardenValues[rowIndex];

            return (
              <EditableCell2
                value={`${plantDripBUSDLPFraction * 100}`}
                onConfirm={handleChangeMonthPlantDripBUSDLPFraction(rowIndex)}
              />
            );
          }}
        />
        <Column
          name={walletsContent.averageGardenDailyYieldColumnLabel}
          cellRenderer={(rowIndex: number, colIndex: number) => {
            const { averageGardenYieldPercentage } = gardenValues[rowIndex];

            return (
              <EditableCell2
                value={`${averageGardenYieldPercentage * 100}`}
                intent={
                  averageGardenYeildPercentageValidationState[
                    `${rowIndex}-${colIndex}`
                  ] ?? Intent.NONE
                }
                onConfirm={averageGardenYieldPercentageCellValidator(
                  rowIndex,
                  colIndex
                )}
                onCancel={averageGardenYieldPercentageCellValidator(
                  rowIndex,
                  colIndex
                )}
              />
            );
          }}
        />
      </Table2>
    );
  };

  return (
    <>
      <Dialog
        title={`"${walletName}" custom garden values`}
        isOpen={isOpen}
        className="bp3-dark deposits-container"
        onClose={onClose}
        canOutsideClickClose={false}
        style={!isMobile ? { minWidth: 768 } : undefined}
      >
        <div className={Classes.DIALOG_BODY}>
          <form onSubmit={(evt) => evt.preventDefault()}>
            <div className="block block-bottom-lg">
              <Button
                icon={showDetails ? "minus" : "caret-down"}
                text={showDetails ? "hide details" : "show details"}
                onClick={handleToggleDetailsClick}
              />
              <p className="block block-bottom-lg">
                {showDetails &&
                  walletsContent.customGardenValuesTableHelpText(
                    currency,
                    fiatMode
                  )}
              </p>
              {fiatMode ? renderFiatTable() : renderNonFiatTable()}
            </div>
            <Button
              icon="plus"
              text={walletsContent.monthsAddAnotherText}
              onClick={handleAddAnotherMonthClick}
            />
            <Button
              icon="minus"
              className="left-small-margin"
              text={walletsContent.monthsRemoveLastMonthText}
              onClick={handleRemoveLastMonthClick}
              // The first 12 months will always be populated!

              disabled={gardenValues.length <= 12}
            />
          </form>
        </div>

        <DialogFooter
          onClose={onClose}
          canSave={
            // Average garden yield percentage must be <= 3!
            Object.values(averageGardenYeildPercentageValidationState).filter(
              (state) => state !== null
            ).length === 0
          }
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

export default WalletCustomGardenValues;
