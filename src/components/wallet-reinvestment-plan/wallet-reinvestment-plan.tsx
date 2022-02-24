import { Dialog, Classes, Button, HTMLSelect } from "@blueprintjs/core";
import {
  Cell,
  Column,
  EditableCell2,
  Table2,
  RenderMode,
} from "@blueprintjs/table";
import React, { useContext } from "react";

import ContentContext, { WalletsContent } from "../../contexts/content";
import moment from "moment";
import { HydrateFrequency, SowFrequency } from "../../store/reducers/settings";
import useMobileCheck from "../../hooks/use-mobile-check";

export type ReinvestmentInEditor = {
  reinvest: number;
  timestamp: number;
  hydrateStrategy?: "default" | HydrateFrequency;
  sowStrategy?: "default" | SowFrequency;
};

type Props = {
  walletName: string;
  walletId: string;
  walletStartDate: number;
  reinvestments: ReinvestmentInEditor[];
  isOpen: boolean;
  forCalculator: "garden" | "faucet";
  onClose: (evt: React.SyntheticEvent<HTMLElement, Event>) => void | undefined;
  onChangeMonthReinvestPercent: (value: number, rowIndex: number) => void;
  onChangeMonthHydrateStrategy?: (
    value: "default" | HydrateFrequency,
    rowIndex: number
  ) => void;
  onChangeMonthSowStrategy?: (
    value: "default" | SowFrequency,
    rowIndex: number
  ) => void;
  onSaveClick: (walletId: string) => void;
  onAddAnotherMonth: () => void;
  onRemoveLastMonth: () => void;
};

function WalletReinvestmentPlan({
  isOpen,
  walletName,
  walletId,
  reinvestments,
  forCalculator,
  onClose,
  onChangeMonthReinvestPercent,
  onChangeMonthHydrateStrategy,
  onChangeMonthSowStrategy,
  onSaveClick,
  onAddAnotherMonth,
  onRemoveLastMonth,
}: Props) {
  const isMobile = useMobileCheck();
  const { wallets: walletsContent } = useContext(ContentContext);

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

  const handleChangeMonthReinvestPercent =
    (rowIndex: number) => (value: string) => {
      onChangeMonthReinvestPercent(Number.parseFloat(value) / 100, rowIndex);
    };

  const handleChangeHydrateorSowStategy =
    (rowIndex: number) => (evt: React.ChangeEvent<HTMLSelectElement>) => {
      if (forCalculator === "faucet" && onChangeMonthHydrateStrategy) {
        onChangeMonthHydrateStrategy(
          evt.currentTarget.value as "default" | HydrateFrequency,
          rowIndex
        );
      } else if (onChangeMonthSowStrategy) {
        onChangeMonthSowStrategy(
          evt.currentTarget.value as "default" | SowFrequency,
          rowIndex
        );
      }
    };

  const {
    reinvestmentPlanTableHelpText,
    hydrateOrSowStrategyColumnLabel,
    reinvestmentPlanHydrateOrSowStrategies,
  } = getWalletsContentForCalculator(forCalculator, walletsContent);
  return (
    <>
      <Dialog
        title={`"${walletName}" ${
          forCalculator === "garden"
            ? "garden reinvestment plan"
            : "reinvestment plan"
        }`}
        isOpen={isOpen}
        className="bp3-dark deposits-container"
        onClose={onClose}
        style={!isMobile ? { minWidth: 768 } : undefined}
        canOutsideClickClose={false}
      >
        <div className={Classes.DIALOG_BODY}>
          <form onSubmit={(evt) => evt.preventDefault()}>
            <div className="block block-bottom-lg">
              <p className="block block-bottom-lg">
                {reinvestmentPlanTableHelpText}
              </p>
              <Table2
                numRows={reinvestments.length}
                minRowHeight={35}
                defaultRowHeight={35}
                columnWidths={[100, 100, 100, 200]}
                // Disables optimised rendering so changes in the hydrate strategy dropdowns
                // reflect without having to change focus of cells in the table!
                renderMode={RenderMode.NONE}
                enableFocusedCell
              >
                <Column
                  name={walletsContent.monthTableColumnLabel}
                  cellRenderer={(rowIndex: number) => {
                    const { timestamp } = reinvestments[rowIndex];
                    return (
                      <Cell>{moment(new Date(timestamp)).format("MMMM")}</Cell>
                    );
                  }}
                />
                <Column
                  name={walletsContent.yearTableColumnLabel}
                  cellRenderer={(rowIndex: number) => {
                    const { timestamp } = reinvestments[rowIndex];
                    return (
                      <Cell>{moment(new Date(timestamp)).format("YYYY")}</Cell>
                    );
                  }}
                />
                <Column
                  name={walletsContent.reinvestColumnLabel}
                  cellRenderer={(rowIndex: number) => {
                    const { reinvest } = reinvestments[rowIndex];

                    return (
                      <EditableCell2
                        value={`${reinvest * 100}`}
                        onConfirm={handleChangeMonthReinvestPercent(rowIndex)}
                      />
                    );
                  }}
                />
                <Column
                  name={hydrateOrSowStrategyColumnLabel}
                  cellRenderer={(rowIndex: number) => {
                    const { sowStrategy } = reinvestments[rowIndex];

                    return (
                      <Cell>
                        <HTMLSelect
                          value={sowStrategy ?? "default"}
                          onChange={handleChangeHydrateorSowStategy(rowIndex)}
                        >
                          {Object.entries(
                            reinvestmentPlanHydrateOrSowStrategies
                          ).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </HTMLSelect>
                      </Cell>
                    );
                  }}
                />
              </Table2>
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
              disabled={reinvestments.length <= 12}
            />
          </form>
        </div>
        <DialogFooter onClose={onClose} canSave onSaveClick={handleSaveClick} />
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

type WalletsContentForCalculator = {
  reinvestmentPlanTableHelpText: React.ReactNode;
  hydrateOrSowStrategyColumnLabel: string;
  reinvestmentPlanHydrateOrSowStrategies:
    | Record<"default" | SowFrequency, string>
    | Record<"default" | HydrateFrequency, string>;
};

function getWalletsContentForCalculator(
  forCalculator: "garden" | "faucet",
  walletsContent: WalletsContent
): WalletsContentForCalculator {
  return {
    reinvestmentPlanTableHelpText:
      forCalculator === "garden" ? (
        <>{walletsContent.gardenReinvestmentPlanTableHelpText}</>
      ) : (
        walletsContent.reinvestmentPlanTableHelpText
      ),
    hydrateOrSowStrategyColumnLabel:
      forCalculator === "garden"
        ? walletsContent.gardenSowStrategyColumnLabel
        : walletsContent.hydrateStrategyColumnLabel,
    reinvestmentPlanHydrateOrSowStrategies:
      forCalculator === "garden"
        ? walletsContent.gardenReinvestmentPlanSowStrategies
        : walletsContent.reinvestmentPlanHydrateStrategies,
  };
}
export default WalletReinvestmentPlan;
