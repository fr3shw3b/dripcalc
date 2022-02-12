import {
  Dialog,
  Classes,
  FormGroup,
  InputGroup,
  Button,
  HTMLSelect,
} from "@blueprintjs/core";
import { DatePicker } from "@blueprintjs/datetime";
import React, { useContext, useState } from "react";

import ContentContext from "../../contexts/content";
import ConfigContext from "../../contexts/config";
import moment from "moment";
import { nanoid } from "nanoid";
import { useSelector } from "react-redux";
import { AppState } from "../../store/types";

export type DepositInEditor = {
  amountInCurrency: number;
  timestamp: number;
  id: string;
  type: string;
  // When type is monthly this is the timestamp deposits are up to.
  upTo?: number;
};

type Props = {
  walletName: string;
  walletId: string;
  walletStartDate: number;
  isOpen: boolean;
  forCalculator: "garden" | "faucet";
  onClose: (evt: React.SyntheticEvent<HTMLElement, Event>) => void | undefined;
  onSaveClick: (walletId: string) => void;
  deposits: DepositInEditor[];
  onAddNewDeposit: (deposit: DepositInEditor) => void;
  onDepositTypeChange: (
    walletId: string,
    depositId: string,
    depositType: string
  ) => void;
  onDepositDateChange: (depositId: string, timestamp: number) => void;
  onDepositEndDateChange: (depositId: string, upToTimestamp: number) => void;
  onDepositAmountInCurrencyChange: (
    depositId: string,
    amountInCurrency: number
  ) => void;
  onRemoveDeposit: (depositId: string) => void;
};

function WalletDeposits({
  isOpen,
  forCalculator,
  walletName,
  onClose,
  onSaveClick,
  walletId,
  walletStartDate,
  deposits,
  onAddNewDeposit,
  onDepositTypeChange,
  onRemoveDeposit,
  onDepositDateChange,
  onDepositEndDateChange,
  onDepositAmountInCurrencyChange,
}: Props) {
  const [showChangeDate, setShowChangeDate] = useState<Record<string, boolean>>(
    {}
  );
  const [showEndChangeDate, setShowEndChangeDate] = useState<
    Record<string, boolean>
  >({});
  const { wallets: walletsContent } = useContext(ContentContext);
  const { minWalletStartDate, maxWalletStartDate } = useContext(ConfigContext);
  const { currency } = useSelector((state: AppState) => {
    const currentPlanId = state.plans.current;
    return state.settings[currentPlanId];
  });

  const handleAddNewDepositClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    onAddNewDeposit({
      timestamp: walletStartDate,
      amountInCurrency: 0,
      id: nanoid(),
      type: "oneOff",
    });
  };

  const handleSaveClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    onSaveClick(walletId);
  };

  const handleChangeDateClick: (depositId: string) => React.MouseEventHandler =
    (depositId) => (evt) => {
      evt.preventDefault();
      setShowChangeDate((prevState) => ({
        ...prevState,
        [depositId]: !prevState[depositId],
      }));
    };

  const handleDepositTypeChange: (
    depositId: string
  ) => React.ChangeEventHandler<HTMLSelectElement> = (depositId) => (evt) => {
    evt.preventDefault();
    onDepositTypeChange(walletId, depositId, evt.currentTarget.value);
  };

  const handleChangeEndDateClick: (
    depositId: string
  ) => React.MouseEventHandler = (depositId) => (evt) => {
    evt.preventDefault();
    setShowEndChangeDate((prevState) => ({
      ...prevState,
      [depositId]: !prevState[depositId],
    }));
  };

  const handleRemoveDepositClick: (
    depositId: string
  ) => React.MouseEventHandler = (depositId) => (evt) => {
    evt.preventDefault();
    onRemoveDeposit(depositId);
  };

  const handleDepositDateChange: (depositId: string) => (date: Date) => void =
    (depositId) => (date) => {
      onDepositDateChange(depositId, date.getTime());
    };

  const handleDepositEndDateChange: (
    depositId: string
  ) => (date: Date) => void = (depositId) => (date) => {
    onDepositEndDateChange(depositId, date.getTime());
  };

  const handleDepositAmountInCurrencyChange: (
    depositId: string
  ) => React.ChangeEventHandler<HTMLInputElement> = (depositId) => (evt) => {
    if (evt.currentTarget.value !== "") {
      onDepositAmountInCurrencyChange(
        depositId,
        Number.parseInt(evt.currentTarget.value)
      );
    }
  };

  return (
    <>
      <Dialog
        title={`"${walletName}" ${
          forCalculator === "garden" ? "garden deposits" : "deposits"
        }`}
        isOpen={isOpen}
        className="bp3-dark deposits-container"
        onClose={onClose}
        canOutsideClickClose={false}
      >
        <div className={Classes.DIALOG_BODY}>
          <form onSubmit={(evt) => evt.preventDefault()}>
            <div className="block block-bottom-lg">
              {deposits.map((deposit) => {
                const date = new Date(deposit.timestamp);
                const upToDate = deposit.upTo ? new Date(deposit.upTo) : date;
                return (
                  <div className="block block-bottom-lg" key={deposit.id}>
                    <FormGroup
                      className="block"
                      label={walletsContent.depositsTypeLabel}
                      helperText={walletsContent.depositsTypeHelpText}
                      labelFor={`deposit-choose-type-${deposit.id}`}
                    >
                      <HTMLSelect
                        id={`deposit-choose-type-${deposit.id}`}
                        value={deposit.type}
                        onChange={handleDepositTypeChange(deposit.id)}
                      >
                        {Object.entries(walletsContent.depositTypes).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          )
                        )}
                      </HTMLSelect>
                    </FormGroup>
                    <FormGroup
                      className="block"
                      label={`${
                        deposit.type === "monthly" ? "Start date: " : ""
                      }${moment(date).format("DD MMMM YYYY")}`}
                      labelFor={`deposit-date-${deposit.id}`}
                      helperText={
                        forCalculator === "garden"
                          ? walletsContent.gardenDepositDateHelpText
                          : ""
                      }
                    >
                      <Button
                        text={
                          !showChangeDate[deposit.id]
                            ? walletsContent.depositsChangeDateText
                            : walletsContent.depositsChangeDateCollapseText
                        }
                        className="block"
                        onClick={handleChangeDateClick(deposit.id)}
                      />
                      {showChangeDate[deposit.id] && (
                        <DatePicker
                          className={`${Classes.ELEVATION_1} block`}
                          onChange={handleDepositDateChange(deposit.id)}
                          defaultValue={new Date(deposit.timestamp)}
                          minDate={new Date(minWalletStartDate)}
                          maxDate={new Date(maxWalletStartDate)}
                          timePrecision={
                            forCalculator === "garden" ? "second" : undefined
                          }
                        />
                      )}
                    </FormGroup>
                    {deposit.type === "monthly" && (
                      <FormGroup
                        className="block"
                        label={`End date: ${moment(upToDate).format(
                          "DD MMMM YYYY"
                        )}`}
                        labelFor={`deposit-end-date-${deposit.id}`}
                        helperText={
                          forCalculator === "garden"
                            ? walletsContent.gardenDepositDateHelpText
                            : ""
                        }
                      >
                        <Button
                          text={
                            !showEndChangeDate[deposit.id]
                              ? walletsContent.depositsChangeDateText
                              : walletsContent.depositsChangeDateCollapseText
                          }
                          className="block"
                          onClick={handleChangeEndDateClick(deposit.id)}
                        />
                        {showEndChangeDate[deposit.id] && (
                          <DatePicker
                            className={`${Classes.ELEVATION_1} block`}
                            onChange={handleDepositEndDateChange(deposit.id)}
                            defaultValue={
                              deposit.upTo
                                ? new Date(deposit.upTo)
                                : new Date(deposit.timestamp)
                            }
                            minDate={new Date(deposit.timestamp)}
                            maxDate={new Date(maxWalletStartDate)}
                            timePrecision={forCalculator ? "second" : undefined}
                          />
                        )}
                      </FormGroup>
                    )}
                    <FormGroup
                      className="block"
                      key={deposit.id}
                      label={walletsContent.depositsAmountInCurrencyLabel(
                        currency
                      )}
                      labelFor={`deposit-${deposit.id}`}
                      helperText={
                        forCalculator === "faucet"
                          ? walletsContent.depositAmountInCurrencyHelpText(
                              currency
                            )
                          : walletsContent.gardenDepositAmountInCurrencyHelpText(
                              currency
                            )
                      }
                    >
                      <InputGroup
                        id={`deposit-amount-in-currency-${deposit.id}`}
                        type="number"
                        asyncControl={true}
                        leftElement={
                          <div className="currency-inline">{currency}</div>
                        }
                        placeholder={`Amount in ${currency}`}
                        value={`${deposit.amountInCurrency}` ?? 0}
                        onChange={handleDepositAmountInCurrencyChange(
                          deposit.id
                        )}
                      />
                    </FormGroup>
                    <Button
                      icon="trash"
                      className="block"
                      onClick={handleRemoveDepositClick(deposit.id)}
                    />
                  </div>
                );
              })}
            </div>
            <Button
              icon="plus"
              text={walletsContent.depositsAddNewText}
              onClick={handleAddNewDepositClick}
            />
          </form>
        </div>
        <DialogFooter
          onClose={onClose}
          canSave={walletName.length > 0}
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

export default WalletDeposits;
