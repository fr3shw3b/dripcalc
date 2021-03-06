import { Dialog, Classes, Button } from "@blueprintjs/core";
import { Cell, Column, EditableCell2, Table2 } from "@blueprintjs/table";
import React, { useContext } from "react";

import ContentContext from "../../contexts/content";
import moment from "moment";
import { useSelector } from "react-redux";
import { AppState } from "../../store/types";
import useMobileCheck from "../../hooks/use-mobile-check";

export type DripValueInEditor = {
  dripValue: number;
  timestamp: number;
};

type Props = {
  walletName: string;
  walletId: string;
  walletStartDate: number;
  dripValues: DripValueInEditor[];
  isOpen: boolean;
  onClose: (evt: React.SyntheticEvent<HTMLElement, Event>) => void | undefined;
  onChangeMonthDripValue: (value: number, rowIndex: number) => void;
  onSaveClick: (walletId: string) => void;
  onAddAnotherMonth: () => void;
  onRemoveLastMonth: () => void;
};

function WalletCustomDripValues({
  isOpen,
  walletName,
  walletId,
  dripValues,
  onClose,
  onChangeMonthDripValue,
  onSaveClick,
  onAddAnotherMonth,
  onRemoveLastMonth,
}: Props) {
  const isMobile = useMobileCheck();
  const { wallets: walletsContent } = useContext(ContentContext);
  const { currency } = useSelector((state: AppState) => {
    const currentPlanId = state.plans.current;
    return state.settings[currentPlanId];
  });

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

  const handleChangeMonthDripValue = (rowIndex: number) => (value: string) => {
    onChangeMonthDripValue(Number.parseFloat(value), rowIndex);
  };

  return (
    <>
      <Dialog
        title={`"${walletName}" custom drip values`}
        isOpen={isOpen}
        className="bp3-dark deposits-container"
        onClose={onClose}
        canOutsideClickClose={false}
        style={!isMobile ? { minWidth: 768 } : undefined}
      >
        <div className={Classes.DIALOG_BODY}>
          <form onSubmit={(evt) => evt.preventDefault()}>
            <div className="block block-bottom-lg">
              <p className="block block-bottom-lg">
                {walletsContent.customDripValuesTableHelpText(currency)}
              </p>
              <Table2 numRows={dripValues.length} enableFocusedCell>
                <Column
                  name={walletsContent.monthTableColumnLabel}
                  cellRenderer={(rowIndex: number) => {
                    const { timestamp } = dripValues[rowIndex];
                    return (
                      <Cell>{moment(new Date(timestamp)).format("MMMM")}</Cell>
                    );
                  }}
                />
                <Column
                  name={walletsContent.yearTableColumnLabel}
                  cellRenderer={(rowIndex: number) => {
                    const { timestamp } = dripValues[rowIndex];
                    return (
                      <Cell>{moment(new Date(timestamp)).format("YYYY")}</Cell>
                    );
                  }}
                />
                <Column
                  name={walletsContent.customDripValuesColumnLabel(currency)}
                  cellRenderer={(rowIndex: number) => {
                    const { dripValue } = dripValues[rowIndex];

                    return (
                      <EditableCell2
                        value={`${dripValue}`}
                        onConfirm={handleChangeMonthDripValue(rowIndex)}
                      />
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
              disabled={dripValues.length <= 12}
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

export default WalletCustomDripValues;
