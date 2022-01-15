import { Tab, Tabs, Button } from "@blueprintjs/core";
import { nanoid } from "nanoid";

import React, { useCallback, useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import ContentContext from "../../contexts/content";
import {
  addWallet,
  updateCurrentWallet,
  updateWallet,
  updateWalletMonthInputs,
} from "../../store/actions/wallets";
import { AppState } from "../../store/types";

import WalletView from "../wallet-view";
import WalletEditor from "../wallet-editor";
import WalletDeposits from "../wallet-deposits";

import "./wallets-panel.css";
import { Deposit, MonthInput, WalletState } from "../../store/reducers/wallets";
import { DepositInEditor } from "../wallet-deposits/wallet-deposits";
import moment from "moment";

type EditorState = {
  isOpen: boolean;
  action: string;
  walletId: string | null;
};

type MonthInputsState = {
  isDepositsOpen: boolean;
  isReinvestmentPlanOpen: boolean;
  walletId: string;
  deposits: DepositInEditor[];
  reinvestments: { timestamp: number; reinvest: number; id: string }[];
};

function WalletsPanel() {
  const [editorState, setEditorState] = useState<EditorState>({
    isOpen: false,
    action: "create",
    walletId: null,
  });
  const [monthInputsState, setMonthInputsState] = useState<MonthInputsState>({
    isDepositsOpen: false,
    isReinvestmentPlanOpen: false,
    walletId: "default-wallet",
    deposits: [],
    reinvestments: [],
  });
  const [editorWalletName, setEditorWalletName] = useState("");
  const [editorWalletDate, setEditorWalletDate] = useState(new Date());
  const dispatch = useDispatch();
  const { wallets, current } = useSelector((state: AppState) => state.wallets);
  const { wallets: walletsContent } = useContext(ContentContext);

  const handleWalletChange = (newTabId: string) => {
    dispatch(updateCurrentWallet(newTabId));
  };

  const handleEditorClose = () => {
    setEditorState({
      isOpen: false,
      action: "create",
      walletId: null,
    });
  };

  const handleAddNewWalletClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    setEditorWalletName("");
    setEditorWalletDate(new Date());
    setEditorState({
      isOpen: true,
      action: "create",
      walletId: null,
    });
  };

  const handleEditorWalletNameChange = (walletName: string) => {
    setEditorWalletName(walletName);
  };

  const handleEditorWalletDateChange = (selectedDate: Date) => {
    setEditorWalletDate(selectedDate);
  };

  const handleEditorSaveClick = (id?: string | null) => {
    if (!id || editorState.action === "create") {
      dispatch(
        addWallet(nanoid(), editorWalletName, editorWalletDate.getTime())
      );
    } else {
      dispatch(updateWallet(id, editorWalletName, editorWalletDate.getTime()));
    }

    setEditorState({
      isOpen: false,
      action: "create",
      walletId: null,
    });
  };

  const handleEditWalletClick = (walletId: string) => {
    const wallet = wallets.find(({ id: currentId }) => currentId === walletId);
    if (wallet) {
      setEditorWalletName(wallet.label);
      setEditorWalletDate(new Date(wallet.startDate));
    }
    setEditorState({
      isOpen: true,
      action: "edit",
      walletId,
    });
  };

  const handleDepositsClick = useCallback(
    (walletId: string) => {
      setMonthInputsState((prevState) => ({
        ...prevState,
        isDepositsOpen: true,
        walletId,
        deposits: depositsFromMonthInputs(
          wallets.find(({ id }) => id === walletId)
        ),
      }));
    },
    [wallets]
  );

  const handleAddNewDeposit = (deposit: DepositInEditor) => {
    setMonthInputsState((prevState) => ({
      ...prevState,
      deposits: [...prevState.deposits, deposit],
    }));
  };

  const handleDepositTypeChange = (
    _walletId: string,
    depositId: string,
    depositType: string
  ) => {
    setMonthInputsState((prevState) => {
      const depositIndex = prevState.deposits.findIndex(
        ({ id }) => id === depositId
      );
      const deposit = prevState.deposits[depositIndex];
      return {
        ...prevState,
        deposits: [
          ...prevState.deposits.slice(0, depositIndex),
          {
            ...deposit,
            type: depositType,
          },
          ...prevState.deposits.slice(depositIndex + 1),
        ],
      };
    });
  };

  const handleDepositDateChange = (depositId: string, timestamp: number) => {
    setMonthInputsState((prevState) => {
      const depositIndex = prevState.deposits.findIndex(
        ({ id }) => id === depositId
      );
      const deposit = prevState.deposits[depositIndex];
      return {
        ...prevState,
        deposits: [
          ...prevState.deposits.slice(0, depositIndex),
          {
            ...deposit,
            timestamp: timestamp,
          },
          ...prevState.deposits.slice(depositIndex + 1),
        ],
      };
    });
  };

  const handleDepositEndDateChange = (
    depositId: string,
    upToTimestamp: number
  ) => {
    setMonthInputsState((prevState) => {
      const depositIndex = prevState.deposits.findIndex(
        ({ id }) => id === depositId
      );
      const deposit = prevState.deposits[depositIndex];
      return {
        ...prevState,
        deposits: [
          ...prevState.deposits.slice(0, depositIndex),
          {
            ...deposit,
            upTo: upToTimestamp,
          },
          ...prevState.deposits.slice(depositIndex + 1),
        ],
      };
    });
  };

  const handleDepositAmountInCurrencyChange = (
    depositId: string,
    amountInCurrency: number
  ) => {
    setMonthInputsState((prevState) => {
      const depositIndex = prevState.deposits.findIndex(
        ({ id }) => id === depositId
      );
      const deposit = prevState.deposits[depositIndex];
      return {
        ...prevState,
        deposits: [
          ...prevState.deposits.slice(0, depositIndex),
          {
            ...deposit,
            amountInCurrency: amountInCurrency,
          },
          ...prevState.deposits.slice(depositIndex + 1),
        ],
      };
    });
  };

  const handleRemoveDeposit = (depositId: string) => {
    setMonthInputsState((prevState) => ({
      ...prevState,
      deposits: prevState.deposits.filter(({ id }) => id !== depositId),
    }));
  };

  const handleDepositsSaveClick = useCallback(
    (walletId: string) => {
      dispatch(
        updateWalletMonthInputs(
          walletId,
          monthInputsFromDeposits(
            monthInputsState.deposits,
            wallets.find(({ id }) => id === walletId)
          )
        )
      );

      setMonthInputsState((prevState) => ({
        ...prevState,
        isDepositsOpen: false,
        deposits: [],
      }));
    },
    [wallets, monthInputsState.deposits]
  );

  const handleDepositsClose = () => {
    setMonthInputsState((prevState) => ({
      ...prevState,
      isDepositsOpen: false,
    }));
  };

  const handleReinvestmentPlanClick = (walletId: string) => {};

  const monthInputsCurrentWallet = wallets.find(
    ({ id }) => id === monthInputsState.walletId
  );

  return (
    <>
      <Tabs
        id="walletTabs"
        onChange={handleWalletChange}
        vertical
        selectedTabId={current}
      >
        {wallets.map(({ id, label, startDate, monthInputs }) => (
          <Tab
            key={id}
            id={id}
            title={label}
            panel={
              <WalletView
                walletId={id}
                label={label}
                startDate={startDate}
                monthInputs={monthInputs}
                onEditClick={handleEditWalletClick}
                onDepositsClick={handleDepositsClick}
                onReinvestmentPlanClick={handleReinvestmentPlanClick}
              />
            }
          />
        ))}
        <Tabs.Expander />
        <Button
          className="wallet-tabs-add-new"
          icon="plus"
          onClick={handleAddNewWalletClick}
        >
          {walletsContent.createNewWalletButtonText}
        </Button>
        <WalletEditor
          walletId={editorState.walletId}
          isOpen={editorState.isOpen}
          walletName={editorWalletName}
          onWalletNameFieldChange={handleEditorWalletNameChange}
          walletDate={editorWalletDate}
          onWalletDateChange={handleEditorWalletDateChange}
          onSaveClick={handleEditorSaveClick}
          onClose={handleEditorClose}
          title={
            editorState.action === "edit"
              ? `Edit "${editorWalletName}"`
              : undefined
          }
        />
        <WalletDeposits
          walletId={monthInputsState.walletId}
          isOpen={monthInputsState.isDepositsOpen}
          walletName={monthInputsCurrentWallet?.label ?? ""}
          walletStartDate={monthInputsCurrentWallet?.startDate ?? 0}
          onSaveClick={handleDepositsSaveClick}
          onClose={handleDepositsClose}
          deposits={monthInputsState.deposits}
          onAddNewDeposit={handleAddNewDeposit}
          onDepositTypeChange={handleDepositTypeChange}
          onDepositDateChange={handleDepositDateChange}
          onDepositEndDateChange={handleDepositEndDateChange}
          onDepositAmountInCurrencyChange={handleDepositAmountInCurrencyChange}
          onRemoveDeposit={handleRemoveDeposit}
        />
      </Tabs>
    </>
  );
}

function depositsFromMonthInputs(wallet?: WalletState): DepositInEditor[] {
  if (!wallet) {
    return [];
  }

  const monthDates = Object.keys(wallet.monthInputs);
  // Make sure month dates are in order when collecting deposits for editor.
  monthDates.sort((monthAStr, monthBStr) => {
    const [_dayA, monthA, yearA] = monthAStr
      .split("/")
      .map((val) => Number.parseInt(val));
    const [_dayB, monthB, yearB] = monthBStr
      .split("/")
      .map((val) => Number.parseInt(val));
    if (yearA < yearB || (yearA === yearB && monthA < monthB)) {
      return -1;
    }
    return 1;
  });

  const seed: DepositInEditor[] = [];
  return monthDates.reduce(
    (depositsForEditor: DepositInEditor[], monthDate): DepositInEditor[] => {
      const deposits = wallet.monthInputs[monthDate].deposits;
      return deposits.reduce(
        (
          accumDepositsForEditor: DepositInEditor[],
          deposit: Deposit
        ): DepositInEditor[] => {
          const existingDepositForEditorIndex =
            accumDepositsForEditor.findIndex(
              ({ id }) => id === deposit.depositId
            );
          if (existingDepositForEditorIndex > -1) {
            // Repeating monthly deposit!
            const existingDepositForEditor =
              accumDepositsForEditor[existingDepositForEditorIndex];
            return [
              ...accumDepositsForEditor.slice(0, existingDepositForEditorIndex),
              {
                ...existingDepositForEditor,
                upTo: deposit.timestamp,
                type: "monthly",
              },
              ...accumDepositsForEditor.slice(
                existingDepositForEditorIndex + 1
              ),
            ];
          }
          return [
            ...accumDepositsForEditor,
            {
              id: deposit.depositId,
              timestamp: deposit.timestamp,
              amountInCurrency: deposit.amountInCurrency,
              type: "oneOff",
            },
          ];
        },
        depositsForEditor
      );
    },
    seed
  );
}

function monthInputsFromDeposits(
  deposits: DepositInEditor[],
  wallet?: WalletState
): Record<string, MonthInput> {
  if (!wallet) {
    return {};
  }

  // Firstly, expand monthly recurring deposits.
  const depositsExpanded = deposits.reduce((accum, deposit) => {
    if (deposit.type === "monthly" && deposit.upTo) {
      const firstMonthFmt = moment(new Date(deposit.timestamp)).format(
        "M/YYYY"
      );
      const lastMonthFmt = moment(new Date(deposit.upTo)).format("M/YYYY");
      if (firstMonthFmt !== lastMonthFmt) {
        // At this point we've made sure the start month and up to month are not the same!
        const monthAfterFinalMonth = moment(new Date(deposit.upTo)).add(
          1,
          "month"
        );
        let currentMonth = moment(new Date(deposit.timestamp)).add(1, "month");
        const expandedDeposits: DepositInEditor[] = [];
        while (
          currentMonth.format("M/YYYY") !==
          monthAfterFinalMonth.format("M/YYYY")
        ) {
          expandedDeposits.push({
            ...deposit,
            // x = unix millisecond timestamp.
            timestamp: Number.parseInt(currentMonth.format("x"), 10),
          });
          currentMonth = currentMonth.add(1, "month");
        }
        return [...accum, ...expandedDeposits];
      }
    }
    return accum;
  }, deposits);

  const seedGrouped: Record<string, DepositInEditor[]> = {};
  const depositsGroupedByMonth = depositsExpanded.reduce(
    (accumGrouped, deposit) => {
      // Super important the key format is DD/MM/YYYYY as expected in the calculator middleware.
      const monthKeyFormatted = moment(new Date(deposit.timestamp)).format(
        "01/MM/YYYY"
      );
      if (accumGrouped[monthKeyFormatted]) {
        return {
          ...accumGrouped,
          [monthKeyFormatted]: [...accumGrouped[monthKeyFormatted], deposit],
        };
      }
      return {
        ...accumGrouped,
        [monthKeyFormatted]: [deposit],
      };
    },
    seedGrouped
  );

  const seedMonthInputs: Record<string, MonthInput> = {};
  return Object.entries(depositsGroupedByMonth).reduce(
    (monthInputs, [monthKey, deposits]) => {
      return {
        ...monthInputs,
        [monthKey]: {
          ...(wallet.monthInputs[monthKey] ?? {}),
          deposits: deposits.map((deposit) => ({
            dayOfMonth: Number.parseInt(
              moment(new Date(deposit.timestamp)).format("D"),
              10
            ),
            timestamp: deposit.timestamp,
            depositId: deposit.id,
            amountInCurrency: deposit.amountInCurrency,
          })),
        },
      };
    },
    seedMonthInputs
  );
}

export default WalletsPanel;
