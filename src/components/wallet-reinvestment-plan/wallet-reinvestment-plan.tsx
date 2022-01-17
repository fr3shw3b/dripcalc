import { Dialog, Classes, Button } from "@blueprintjs/core";
import { Cell, Column, EditableCell2, Table2 } from "@blueprintjs/table";
import React, { useContext } from "react";

import ContentContext from "../../contexts/content";
import moment from "moment";

export type ReinvestmentInEditor = {
  reinvest: number;
  timestamp: number;
};

type Props = {
  walletName: string;
  walletId: string;
  walletStartDate: number;
  reinvestments: ReinvestmentInEditor[];
  isOpen: boolean;
  onClose: (evt: React.SyntheticEvent<HTMLElement, Event>) => void | undefined;
  onChangeMonthReinvestPercent: (value: number, rowIndex: number) => void;
  onSaveClick: (walletId: string) => void;
  onAddAnotherMonth: () => void;
};

function WalletReinvestmentPlan({
  isOpen,
  walletName,
  walletId,
  reinvestments,
  onClose,
  onChangeMonthReinvestPercent,
  onSaveClick,
  onAddAnotherMonth,
}: Props) {
  const { wallets: walletsContent } = useContext(ContentContext);

  const handleSaveClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    onSaveClick(walletId);
  };

  const handleAddAnotherMonthClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    onAddAnotherMonth();
  };

  const handleChangeMonthReinvestPercent =
    (rowIndex: number) => (value: string) => {
      onChangeMonthReinvestPercent(Number.parseFloat(value) / 100, rowIndex);
    };

  return (
    <>
      <Dialog
        title={`"${walletName}" reinvestment plan`}
        isOpen={isOpen}
        className="bp3-dark deposits-container"
        onClose={onClose}
        style={{ minWidth: 768 }}
        canOutsideClickClose={false}
      >
        <div className={Classes.DIALOG_BODY}>
          <form onSubmit={(evt) => evt.preventDefault()}>
            <div className="block block-bottom-lg">
              <p className="block block-bottom-lg">
                {walletsContent.reinvestmentPlanTableHelpText}
              </p>
              <Table2 numRows={reinvestments.length}>
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
              </Table2>
            </div>
            <Button
              icon="plus"
              text={walletsContent.monthsAddAnotherText}
              onClick={handleAddAnotherMonthClick}
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

export default WalletReinvestmentPlan;
