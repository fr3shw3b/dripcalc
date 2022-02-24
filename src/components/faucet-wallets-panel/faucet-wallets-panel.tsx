import { Tab, Tabs, Button } from "@blueprintjs/core";
import { nanoid } from "nanoid";

import React, { useCallback, useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

import ContentContext from "../../contexts/content";
import ConfigContext, { Config } from "../../contexts/config";
import {
  addWallet,
  updateCurrentWallet,
  updateWallet,
  updateWalletMonthInputs,
} from "../../store/actions/plans";
import { AppState } from "../../store/types";

import WalletView from "../wallet-view";
import WalletEditor from "../wallet-editor";
import WalletDeposits from "../wallet-deposits";
import WalletReinvestmentPlan from "../wallet-reinvestment-plan";
import WalletCustomDripValues from "../wallet-custom-drip-values";

import "./faucet-wallets-panel.css";
import { Deposit, MonthInput, WalletState } from "../../store/reducers/plans";
import { DepositInEditor } from "../wallet-deposits/wallet-deposits";
import { ReinvestmentInEditor } from "../wallet-reinvestment-plan/wallet-reinvestment-plan";
import type { DripValueInEditor } from "../wallet-custom-drip-values/wallet-custom-drip-values";
import { HydrateFrequency } from "../../store/reducers/settings";
import useMobileCheck from "../../hooks/use-mobile-check";
import FeatureTogglesContext from "../../contexts/feature-toggles";

type EditorState = {
  isOpen: boolean;
  action: string;
  walletId: string | null;
};

type MonthInputsState = {
  isDepositsOpen: boolean;
  isReinvestmentPlanOpen: boolean;
  isCustomDripValuesOpen: boolean;
  walletId: string;
  deposits: DepositInEditor[];
  reinvestments: ReinvestmentInEditor[];
  dripValues: DripValueInEditor[];
};

function FaucetWalletsPanel() {
  const isMobile = useMobileCheck();
  const featureToggles = useContext(FeatureTogglesContext);
  const [editorState, setEditorState] = useState<EditorState>({
    isOpen: false,
    action: "create",
    walletId: null,
  });
  const [monthInputsState, setMonthInputsState] = useState<MonthInputsState>({
    isDepositsOpen: false,
    isReinvestmentPlanOpen: false,
    isCustomDripValuesOpen: false,
    walletId: "default-wallet",
    deposits: [],
    reinvestments: [],
    dripValues: [],
  });
  const [editorWalletName, setEditorWalletName] = useState("");
  const [editorWalletDate, setEditorWalletDate] = useState(new Date());
  const dispatch = useDispatch();
  const { wallets, current, currentPlanId, fiatModeInState } = useSelector(
    (state: AppState) => {
      const currentPlanIndex = state.plans.plans.findIndex(
        (plan) => plan.id === state.plans.current
      );
      return {
        wallets: state.plans.plans[currentPlanIndex].wallets,
        current: state.plans.plans[currentPlanIndex].current,
        currentPlanId: state.plans.current,
        fiatModeInState: state.general.fiatMode,
      };
    }
  );
  const fiatMode =
    (featureToggles.dripFiatModeToggle && fiatModeInState) ||
    !featureToggles.dripFiatModeToggle;
  const { wallets: walletsContent } = useContext(ContentContext);
  const config = useContext(ConfigContext);

  const handleWalletChange = (newTabId: string) => {
    dispatch(updateCurrentWallet(newTabId, currentPlanId));
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
        addWallet(
          nanoid(),
          currentPlanId,
          editorWalletName,
          editorWalletDate.getTime()
        )
      );
    } else {
      dispatch(
        updateWallet(
          id,
          currentPlanId,
          editorWalletName,
          editorWalletDate.getTime()
        )
      );
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

  const handleDepositAmountChange = (
    depositId: string,
    amount: number,
    eventFiatMode: boolean
  ) => {
    setMonthInputsState((prevState) => {
      const depositIndex = prevState.deposits.findIndex(
        ({ id }) => id === depositId
      );
      const deposit = prevState.deposits[depositIndex];
      const updatedFields = eventFiatMode
        ? { amountInCurrency: amount }
        : { amountInToken: amount };
      return {
        ...prevState,
        deposits: [
          ...prevState.deposits.slice(0, depositIndex),
          {
            ...deposit,
            ...updatedFields,
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
          currentPlanId,
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
    [wallets, currentPlanId, monthInputsState.deposits, dispatch]
  );

  const handleDepositsClose = () => {
    setMonthInputsState((prevState) => ({
      ...prevState,
      isDepositsOpen: false,
    }));
  };

  const handleReinvestmentPlanClose = () => {
    setMonthInputsState((prevState) => ({
      ...prevState,
      isReinvestmentPlanOpen: false,
    }));
  };

  const handleReinvestmentPlanClick = useCallback(
    (walletId: string) => {
      setMonthInputsState((prevState) => ({
        ...prevState,
        isReinvestmentPlanOpen: true,
        walletId,
        reinvestments: reinvestmentsFromMonthInputs(
          config,
          wallets.find(({ id }) => id === walletId)
        ),
      }));
    },
    [wallets, config]
  );

  const handleChangeMonthReinvestPercent = (
    reinvest: number,
    index: number
  ) => {
    setMonthInputsState((prevState) => {
      const reinvestment = prevState.reinvestments[index];
      return {
        ...prevState,
        reinvestments: [
          ...prevState.reinvestments.slice(0, index),
          {
            ...reinvestment,
            reinvest,
          },
          ...prevState.reinvestments.slice(index + 1),
        ],
      };
    });
  };

  const handleChangeMonthHydrateStrategy = (
    strategy: "default" | HydrateFrequency,
    index: number
  ) => {
    setMonthInputsState((prevState) => {
      const reinvestment = prevState.reinvestments[index];
      return {
        ...prevState,
        reinvestments: [
          ...prevState.reinvestments.slice(0, index),
          {
            ...reinvestment,
            hydrateStrategy: strategy,
          },
          ...prevState.reinvestments.slice(index + 1),
        ],
      };
    });
  };

  const handleReinvestSaveClick = useCallback(
    (walletId: string) => {
      dispatch(
        updateWalletMonthInputs(
          walletId,
          currentPlanId,
          monthInputsFromReinvestments(
            monthInputsState.reinvestments,
            wallets.find(({ id }) => id === walletId)
          )
        )
      );

      setMonthInputsState((prevState) => ({
        ...prevState,
        isReinvestmentPlanOpen: false,
        reinvestments: [],
      }));
    },
    [wallets, currentPlanId, monthInputsState.reinvestments, dispatch]
  );

  const handleAddAnotherReinvestMonth = () => {
    setMonthInputsState((prevState) => ({
      ...prevState,
      reinvestments: [
        ...prevState.reinvestments,
        {
          reinvest: config.defaultReinvest,
          hydrateStrategy: "default",
          timestamp: Number.parseInt(
            moment(
              new Date(
                prevState.reinvestments[
                  prevState.reinvestments.length - 1
                ].timestamp
              )
            )
              .add(1, "month")
              .format("x")
          ),
        },
      ],
    }));
  };

  const handleRemoveLastReinvestMonth = () => {
    setMonthInputsState((prevState) => {
      if (prevState.reinvestments.length <= 1) {
        return {
          ...prevState,
          reinvestments: [],
        };
      }
      return {
        ...prevState,
        reinvestments: prevState.reinvestments.slice(
          0,
          prevState.reinvestments.length - 1
        ),
      };
    });
  };

  const handleCustomDripValuesClose = () => {
    setMonthInputsState((prevState) => ({
      ...prevState,
      isCustomDripValuesOpen: false,
    }));
  };

  const handleDripCustomValuesClick = useCallback(
    (walletId: string) => {
      setMonthInputsState((prevState) => ({
        ...prevState,
        isCustomDripValuesOpen: true,
        walletId,
        dripValues: dripValuesFromMonthInputs(
          config,
          wallets.find(({ id }) => id === walletId)
        ),
      }));
    },
    [wallets, config]
  );

  const handleChangeMonthDripValue = (dripValue: number, index: number) => {
    setMonthInputsState((prevState) => {
      const dripValueObj = prevState.dripValues[index];
      return {
        ...prevState,
        dripValues: [
          ...prevState.dripValues.slice(0, index),
          {
            timestamp: dripValueObj.timestamp,
            dripValue,
          },
          ...prevState.dripValues.slice(index + 1),
        ],
      };
    });
  };

  const handleCustomDripValuesSaveClick = useCallback(
    (walletId: string) => {
      dispatch(
        updateWalletMonthInputs(
          walletId,
          currentPlanId,
          monthInputsFromDripValues(
            monthInputsState.dripValues,
            wallets.find(({ id }) => id === walletId)
          )
        )
      );

      setMonthInputsState((prevState) => ({
        ...prevState,
        isCustomDripValuesOpen: false,
        dripValues: [],
      }));
    },
    [wallets, currentPlanId, monthInputsState.dripValues, dispatch]
  );

  const handleAddAnotherDripValueMonth = () => {
    setMonthInputsState((prevState) => ({
      ...prevState,
      dripValues: [
        ...prevState.dripValues,
        {
          dripValue: config.defaultDripValue,
          timestamp: Number.parseInt(
            moment(
              new Date(
                prevState.dripValues[prevState.dripValues.length - 1].timestamp
              )
            )
              .add(1, "month")
              .format("x")
          ),
        },
      ],
    }));
  };

  const handleRemoveLastDripValueMonth = () => {
    setMonthInputsState((prevState) => {
      if (prevState.dripValues.length <= 1) {
        return {
          ...prevState,
          dripValues: [],
        };
      }
      return {
        ...prevState,
        dripValues: prevState.dripValues.slice(
          0,
          prevState.dripValues.length - 1
        ),
      };
    });
  };

  const monthInputsCurrentWallet = wallets.find(
    ({ id }) => id === monthInputsState.walletId
  );

  return (
    <>
      <Tabs
        id="walletTabs"
        onChange={handleWalletChange}
        vertical={!isMobile}
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
                editMode
                forCalculator="faucet"
                startDate={startDate}
                monthInputs={monthInputs}
                onEditClick={handleEditWalletClick}
                onDepositsClick={handleDepositsClick}
                onReinvestmentPlanClick={handleReinvestmentPlanClick}
                onCustomValuesClick={handleDripCustomValuesClick}
                fiatMode={
                  (featureToggles.dripFiatModeToggle && fiatMode) ||
                  !featureToggles.dripFiatModeToggle
                }
              />
            }
          />
        ))}
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
          forCalculator="faucet"
          walletName={monthInputsCurrentWallet?.label ?? ""}
          walletStartDate={monthInputsCurrentWallet?.startDate ?? 0}
          onSaveClick={handleDepositsSaveClick}
          onClose={handleDepositsClose}
          deposits={monthInputsState.deposits}
          onAddNewDeposit={handleAddNewDeposit}
          onDepositTypeChange={handleDepositTypeChange}
          onDepositDateChange={handleDepositDateChange}
          onDepositEndDateChange={handleDepositEndDateChange}
          onDepositAmountChange={handleDepositAmountChange}
          onRemoveDeposit={handleRemoveDeposit}
          fiatMode={fiatMode}
        />

        <WalletReinvestmentPlan
          walletId={monthInputsState.walletId}
          isOpen={monthInputsState.isReinvestmentPlanOpen}
          forCalculator="faucet"
          walletName={monthInputsCurrentWallet?.label ?? ""}
          walletStartDate={monthInputsCurrentWallet?.startDate ?? 0}
          onClose={handleReinvestmentPlanClose}
          reinvestments={monthInputsState.reinvestments}
          onChangeMonthReinvestPercent={handleChangeMonthReinvestPercent}
          onChangeMonthHydrateStrategy={handleChangeMonthHydrateStrategy}
          onSaveClick={handleReinvestSaveClick}
          onAddAnotherMonth={handleAddAnotherReinvestMonth}
          onRemoveLastMonth={handleRemoveLastReinvestMonth}
        />
        {fiatMode && (
          <WalletCustomDripValues
            walletId={monthInputsState.walletId}
            isOpen={monthInputsState.isCustomDripValuesOpen}
            walletName={monthInputsCurrentWallet?.label ?? ""}
            walletStartDate={monthInputsCurrentWallet?.startDate ?? 0}
            onClose={handleCustomDripValuesClose}
            dripValues={monthInputsState.dripValues}
            onChangeMonthDripValue={handleChangeMonthDripValue}
            onSaveClick={handleCustomDripValuesSaveClick}
            onAddAnotherMonth={handleAddAnotherDripValueMonth}
            onRemoveLastMonth={handleRemoveLastDripValueMonth}
          />
        )}
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
    // eslint-disable-next-line
    const [_dayA, monthA, yearA] = monthAStr
      .split("/")
      .map((val) => Number.parseInt(val));
    // eslint-disable-next-line
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
      const deposits = wallet.monthInputs[monthDate].deposits ?? [];
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
              amountInToken: deposit.amountInTokens,
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

  const seedMonthInputs: Record<string, MonthInput> = Object.entries(
    wallet?.monthInputs ?? {}
  ).reduce((accum, [monthKey, inputs]) => {
    return {
      ...accum,
      [monthKey]: {
        ...inputs,
        // clear out existing deposits for existing entries before
        // adding the new set of deposits.
        // We don't want to lose reinvestment plan and custom DRIP value inputs
        // when updating deposits.
        deposits: [],
      },
    };
  }, {} as Record<string, MonthInput>);
  return Object.entries(depositsGroupedByMonth).reduce(
    (accumMonthInputs, [monthKey, deposits]) => {
      return {
        ...accumMonthInputs,
        [monthKey]: {
          ...(accumMonthInputs[monthKey] ?? {}),
          deposits: deposits.map((deposit) => ({
            dayOfMonth: Number.parseInt(
              moment(new Date(deposit.timestamp)).format("D"),
              10
            ),
            timestamp: deposit.timestamp,
            depositId: deposit.id,
            amountInCurrency: deposit.amountInCurrency,
            amountInTokens: deposit.amountInToken,
          })),
        },
      };
    },
    seedMonthInputs
  );
}

function reinvestmentsFromMonthInputs(
  config: Config,
  wallet?: WalletState
): ReinvestmentInEditor[] {
  if (!wallet) {
    return [];
  }
  const reinvestments = Object.entries(wallet.monthInputs)
    .map(([monthKey, { reinvest, hydrateStrategy }]) => {
      return {
        reinvest: reinvest,
        timestamp: Number.parseInt(
          moment(monthKey, "DD/MM/YYYY").format("x"),
          10
        ),
        hydrateStrategy,
      };
    })
    .filter(
      ({ reinvest }) => typeof reinvest !== "undefined"
    ) as ReinvestmentInEditor[];

  // Default with a year's worth of reinvestment.
  return [...Array(Math.max(reinvestments.length, 12))].map((_, i) => {
    const timestamp = Number.parseInt(
      moment(new Date(wallet.startDate))
        .add(i, "month")
        .startOf("month")
        .format("x"),
      10
    );
    const existingReinvestmentForTimestamp = reinvestments.find(
      (reinvestment) => reinvestment.timestamp === timestamp
    );
    return {
      reinvest:
        existingReinvestmentForTimestamp?.reinvest ?? config.defaultReinvest,
      timestamp,
      hydrateStrategy:
        existingReinvestmentForTimestamp?.hydrateStrategy ?? "default",
    };
  });
}

function monthInputsFromReinvestments(
  reinvestments: ReinvestmentInEditor[],
  wallet?: WalletState
): Record<string, MonthInput> {
  if (!wallet) {
    return {};
  }

  const seedGrouped: Record<string, ReinvestmentInEditor> = {};
  const reinvestGroupedByMonth = reinvestments.reduce(
    (accumGrouped, reinvestment) => {
      // Super important the key format is DD/MM/YYYYY as expected in the calculator middleware.
      const monthKeyFormatted = moment(new Date(reinvestment.timestamp)).format(
        "01/MM/YYYY"
      );

      return {
        ...accumGrouped,
        [monthKeyFormatted]: reinvestment,
      };
    },
    seedGrouped
  );

  const seedMonthInputs: Record<string, MonthInput> = {};
  return Object.entries(reinvestGroupedByMonth).reduce(
    (monthInputs, [monthKey, reinvestment]) => {
      return {
        ...monthInputs,
        [monthKey]: {
          ...(wallet.monthInputs[monthKey] ?? {}),
          reinvest: reinvestment.reinvest,
          hydrateStrategy: reinvestment.hydrateStrategy,
        },
      };
    },
    seedMonthInputs
  );
}

function monthInputsFromDripValues(
  dripValues: DripValueInEditor[],
  wallet?: WalletState
): Record<string, MonthInput> {
  if (!wallet) {
    return {};
  }

  const seedGrouped: Record<string, number> = {};
  const dripValuesGroupedByMonth = dripValues.reduce(
    (accumGrouped, dripValueObj) => {
      // Super important the key format is DD/MM/YYYYY as expected in the calculator middleware.
      const monthKeyFormatted = moment(new Date(dripValueObj.timestamp)).format(
        "01/MM/YYYY"
      );

      return {
        ...accumGrouped,
        [monthKeyFormatted]: dripValueObj.dripValue,
      };
    },
    seedGrouped
  );

  const seedMonthInputs: Record<string, MonthInput> = {};
  return Object.entries(dripValuesGroupedByMonth).reduce(
    (monthInputs, [monthKey, dripValue]) => {
      return {
        ...monthInputs,
        [monthKey]: {
          ...(wallet.monthInputs[monthKey] ?? {}),
          dripValue,
        },
      };
    },
    seedMonthInputs
  );
}

function dripValuesFromMonthInputs(
  config: Config,
  wallet?: WalletState
): DripValueInEditor[] {
  if (!wallet) {
    return [];
  }
  const dripValues = Object.entries(wallet.monthInputs)
    .map(([monthKey, { dripValue }]) => {
      return {
        dripValue,
        timestamp: Number.parseInt(
          moment(monthKey, "DD/MM/YYYY").format("x"),
          10
        ),
      };
    })
    // filter out months with undefined drip values.
    .filter(
      ({ dripValue }) => typeof dripValue !== "undefined"
    ) as DripValueInEditor[];

  // Default with a year's worth of reinvestment.
  return [...Array(Math.max(dripValues.length, 12))].map((_, i) => {
    const timestamp = Number.parseInt(
      moment(new Date(wallet.startDate))
        .add(i, "month")
        .startOf("month")
        .format("x"),
      10
    );
    const existingDripValueForTimestamp = dripValues.find(
      (dripValue) => dripValue.timestamp === timestamp
    );
    return {
      dripValue:
        existingDripValueForTimestamp?.dripValue ?? config.defaultDripValue,
      timestamp,
    };
  });
}

export default FaucetWalletsPanel;
