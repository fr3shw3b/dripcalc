import { Button, Tab, Tabs } from "@blueprintjs/core";
import { useCallback, useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { useNavigate } from "react-router-dom";

import ConfigContext, { Config } from "../../contexts/config";
import FeatureTogglesContext from "../../contexts/feature-toggles";

import {
  updateCurrentWallet,
  updateWalletMonthInputs,
} from "../../store/actions/plans";
import { AppState } from "../../store/types";

import WalletView from "../wallet-view";
import WalletDeposits from "../wallet-deposits";
import WalletReinvestmentPlan from "../wallet-reinvestment-plan";

import "./garden-wallets-panel.css";
import {
  Deposit,
  GardenValues,
  MonthInput,
  WalletState,
} from "../../store/reducers/plans";
import { DepositInEditor } from "../wallet-deposits/wallet-deposits";
import { ReinvestmentInEditor } from "../wallet-reinvestment-plan/wallet-reinvestment-plan";
import { SowFrequency } from "../../store/reducers/settings";
import useMobileCheck from "../../hooks/use-mobile-check";
import { GardenValuesInEditor } from "../wallet-custom-garden-values/wallet-custom-garden-values";
import WalletCustomGardenValues from "../wallet-custom-garden-values";

type MonthInputsState = {
  isDepositsOpen: boolean;
  isReinvestmentPlanOpen: boolean;
  isCustomGardenValuesOpen: boolean;
  walletId: string;
  deposits: DepositInEditor[];
  reinvestments: ReinvestmentInEditor[];
  gardenValues: GardenValuesInEditor[];
};

function GardenWalletsPanel() {
  const isMobile = useMobileCheck();
  const navigate = useNavigate();
  const [monthInputsState, setMonthInputsState] = useState<MonthInputsState>({
    isDepositsOpen: false,
    isReinvestmentPlanOpen: false,
    isCustomGardenValuesOpen: false,
    walletId: "default-wallet",
    deposits: [],
    reinvestments: [],
    gardenValues: [],
  });
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
  const config = useContext(ConfigContext);
  const featureToggles = useContext(FeatureTogglesContext);

  const fiatMode =
    (featureToggles.dripFiatModeToggle && fiatModeInState) ||
    !featureToggles.dripFiatModeToggle;

  const handleWalletChange = (newTabId: string) => {
    dispatch(updateCurrentWallet(newTabId, currentPlanId));
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

  const handleChangeMonthSowStrategy = (
    strategy: "default" | SowFrequency,
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
            sowStrategy: strategy,
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

  const handleCustomGardenValuesClose = () => {
    setMonthInputsState((prevState) => ({
      ...prevState,
      isCustomGardenValuesOpen: false,
    }));
  };

  const handleGardenCustomValuesClick = useCallback(
    (walletId: string) => {
      setMonthInputsState((prevState) => ({
        ...prevState,
        isCustomGardenValuesOpen: true,
        walletId,
        gardenValues: gardenValuesFromMonthInputs(
          config,
          wallets.find(({ id }) => id === walletId)
        ),
      }));
    },
    [wallets, config]
  );

  const handleChangeMonthGardenValues = (
    gardenValues: Partial<GardenValuesInEditor>,
    index: number
  ) => {
    setMonthInputsState((prevState) => {
      const gardenValuesObj = prevState.gardenValues[index];
      return {
        ...prevState,
        gardenValues: [
          ...prevState.gardenValues.slice(0, index),
          {
            ...gardenValuesObj,
            // Patch changes in by overriding only the updated fields!
            ...gardenValues,
          },
          ...prevState.gardenValues.slice(index + 1),
        ],
      };
    });
  };

  const handleCustomGardenValuesSaveClick = useCallback(
    (walletId: string) => {
      dispatch(
        updateWalletMonthInputs(
          walletId,
          currentPlanId,
          monthInputsFromGardenValues(
            monthInputsState.gardenValues,
            wallets.find(({ id }) => id === walletId)
          )
        )
      );

      setMonthInputsState((prevState) => ({
        ...prevState,
        isCustomGardenValuesOpen: false,
        dripValues: [],
      }));
    },
    [wallets, currentPlanId, monthInputsState.gardenValues, dispatch]
  );

  const handleAddAnotherGardenValuesMonth = () => {
    setMonthInputsState((prevState) => ({
      ...prevState,
      gardenValues: [
        ...prevState.gardenValues,
        {
          dripBUSDLPValue: config.defaultDripBUSDLPValue,
          plantDripBUSDLPFraction: config.defaultMaxPlantDripBUSDLPFraction,
          averageGardenYieldPercentage:
            config.defaultAverageGardenYieldPercentage,
          timestamp: Number.parseInt(
            moment(
              new Date(
                prevState.gardenValues[
                  prevState.gardenValues.length - 1
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

  const handleRemoveLastGardenValuesMonth = () => {
    setMonthInputsState((prevState) => {
      if (prevState.gardenValues.length <= 1) {
        return {
          ...prevState,
          gardenValues: [],
        };
      }
      return {
        ...prevState,
        gardenValues: prevState.gardenValues.slice(
          0,
          prevState.gardenValues.length - 1
        ),
      };
    });
  };

  const handleManageWalletClick = () => {
    navigate({ pathname: "/", search: "?tab=dashboard-manage-wallets" });
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
                forCalculator="garden"
                startDate={startDate}
                monthInputs={monthInputs}
                editMode={false}
                fiatMode={fiatMode}
                onDepositsClick={handleDepositsClick}
                onReinvestmentPlanClick={handleReinvestmentPlanClick}
                onCustomValuesClick={handleGardenCustomValuesClick}
              />
            }
          />
        ))}
        <Button
          className="wallet-tabs-manage"
          onClick={handleManageWalletClick}
        >
          manage wallets
        </Button>
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
          onDepositAmountChange={handleDepositAmountChange}
          onRemoveDeposit={handleRemoveDeposit}
          forCalculator="garden"
          fiatMode={fiatMode}
        />
        <WalletReinvestmentPlan
          walletId={monthInputsState.walletId}
          isOpen={monthInputsState.isReinvestmentPlanOpen}
          walletName={monthInputsCurrentWallet?.label ?? ""}
          walletStartDate={monthInputsCurrentWallet?.startDate ?? 0}
          onClose={handleReinvestmentPlanClose}
          reinvestments={monthInputsState.reinvestments}
          onChangeMonthReinvestPercent={handleChangeMonthReinvestPercent}
          onChangeMonthSowStrategy={handleChangeMonthSowStrategy}
          onSaveClick={handleReinvestSaveClick}
          onAddAnotherMonth={handleAddAnotherReinvestMonth}
          onRemoveLastMonth={handleRemoveLastReinvestMonth}
          forCalculator="garden"
        />
        <WalletCustomGardenValues
          walletId={monthInputsState.walletId}
          isOpen={monthInputsState.isCustomGardenValuesOpen}
          walletName={monthInputsCurrentWallet?.label ?? ""}
          walletStartDate={monthInputsCurrentWallet?.startDate ?? 0}
          onClose={handleCustomGardenValuesClose}
          gardenValues={monthInputsState.gardenValues}
          onChangeMonthGardenValues={handleChangeMonthGardenValues}
          onSaveClick={handleCustomGardenValuesSaveClick}
          onAddAnotherMonth={handleAddAnotherGardenValuesMonth}
          onRemoveLastMonth={handleRemoveLastGardenValuesMonth}
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
      const deposits = wallet.monthInputs[monthDate].gardenDeposits ?? [];
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
              amountInToken: deposit.amountInTokens,
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
        // We don't want to lose reinvestment plan and custom DRIP/BUSD LP value inputs
        // when updating deposits.
        gardenDeposits: [],
      },
    };
  }, {} as Record<string, MonthInput>);
  return Object.entries(depositsGroupedByMonth).reduce(
    (accumMonthInputs, [monthKey, gardenDeposits]) => {
      return {
        ...accumMonthInputs,
        [monthKey]: {
          ...(accumMonthInputs[monthKey] ?? {}),
          gardenDeposits: gardenDeposits.map((deposit) => ({
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
    .map(([monthKey, { gardenReinvest, sowStrategy }]) => {
      return {
        reinvest: gardenReinvest,
        timestamp: Number.parseInt(
          moment(monthKey, "DD/MM/YYYY").format("x"),
          10
        ),
        sowStrategy,
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
        existingReinvestmentForTimestamp?.reinvest ??
        config.defaultGardenReinvest,
      timestamp,
      sowStrategy: existingReinvestmentForTimestamp?.sowStrategy ?? "default",
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

  const monthInputsReinvestmentReset = Object.entries(
    wallet.monthInputs
  ).reduce((accum, [key, value]) => {
    return {
      ...accum,
      [key]: { ...value, gardenReinvest: undefined, sowStrategy: undefined },
    };
  }, {} as Record<string, MonthInput>);

  const seedMonthInputs: Record<string, MonthInput> = {};
  const updatedMonthInputs = Object.entries(reinvestGroupedByMonth).reduce(
    (monthInputs, [monthKey, reinvestment]) => {
      return {
        ...monthInputs,
        [monthKey]: {
          ...(wallet.monthInputs[monthKey] ?? {}),
          gardenReinvest: reinvestment.reinvest,
          sowStrategy: reinvestment.sowStrategy,
        },
      };
    },
    seedMonthInputs
  );

  return {
    ...monthInputsReinvestmentReset,
    ...updatedMonthInputs,
  };
}

function monthInputsFromGardenValues(
  gardenValues: GardenValuesInEditor[],
  wallet?: WalletState
): Record<string, MonthInput> {
  if (!wallet) {
    return {};
  }

  const seedGrouped: Record<string, GardenValues> = {};
  const gardenValuesGroupedByMonth = gardenValues.reduce(
    (accumGrouped, gardenValuesObj) => {
      // Super important the key format is DD/MM/YYYYY as expected in the calculator middleware.
      const monthKeyFormatted = moment(
        new Date(gardenValuesObj.timestamp)
      ).format("01/MM/YYYY");

      const { timestamp: _timestamp, ...rest } = gardenValuesObj;
      return {
        ...accumGrouped,
        [monthKeyFormatted]: rest,
      };
    },
    seedGrouped
  );

  const monthInputsResetGardenValues = Object.entries(
    wallet.monthInputs
  ).reduce((accum, [key, value]) => {
    return {
      ...accum,
      [key]: {
        ...value,
        gardenValues: undefined,
      },
    };
  }, {} as Record<string, MonthInput>);

  const seedMonthInputs: Record<string, MonthInput> = {};
  const updatedMonthInputs = Object.entries(gardenValuesGroupedByMonth).reduce(
    (monthInputs, [monthKey, monthGardenValues]) => {
      return {
        ...monthInputs,
        [monthKey]: {
          ...(wallet.monthInputs[monthKey] ?? {}),
          gardenValues: monthGardenValues,
        },
      };
    },
    seedMonthInputs
  );

  return {
    ...monthInputsResetGardenValues,
    ...updatedMonthInputs,
  };
}

function gardenValuesFromMonthInputs(
  config: Config,
  wallet?: WalletState
): GardenValuesInEditor[] {
  if (!wallet) {
    return [];
  }
  const gardenValuesList = Object.entries(wallet.monthInputs)
    .map(([monthKey, { gardenValues }]): Partial<GardenValuesInEditor> => {
      return {
        dripBUSDLPValue: gardenValues?.dripBUSDLPValue,
        plantDripBUSDLPFraction: gardenValues?.plantDripBUSDLPFraction,
        averageGardenYieldPercentage:
          gardenValues?.averageGardenYieldPercentage,
        timestamp: Number.parseInt(
          moment(monthKey, "DD/MM/YYYY").format("x"),
          10
        ),
      };
    })
    // filter down to only months where none of the values are undefined!
    .filter(
      ({
        dripBUSDLPValue,
        plantDripBUSDLPFraction,
        averageGardenYieldPercentage,
      }) =>
        typeof dripBUSDLPValue !== "undefined" ||
        typeof plantDripBUSDLPFraction !== "undefined" ||
        typeof averageGardenYieldPercentage !== "undefined"
    ) as GardenValuesInEditor[];

  // Default with a year's worth of reinvestment.
  return [...Array(Math.max(gardenValuesList.length, 12))].map((_, i) => {
    const timestamp = Number.parseInt(
      moment(new Date(wallet.startDate))
        .add(i, "month")
        .startOf("month")
        .format("x"),
      10
    );
    const existingGardenValuesForTimestamp = gardenValuesList.find(
      (gardenValues) => gardenValues.timestamp === timestamp
    );

    const reverseI = 12 - i;
    return {
      dripBUSDLPValue:
        existingGardenValuesForTimestamp?.dripBUSDLPValue ??
        // Default to a downtrend for LP value for first 12 months.
        // Go down to 60% of default/start point.
        config.defaultDripBUSDLPValue -
          (config.defaultDripBUSDLPValue * 0.4) / reverseI,
      plantDripBUSDLPFraction:
        existingGardenValuesForTimestamp?.plantDripBUSDLPFraction ??
        // Default to a downtrend for Plant:LP ratio first 12 months!
        // Go down to 50% of default/start point.
        config.defaultMaxPlantDripBUSDLPFraction -
          (config.defaultMaxPlantDripBUSDLPFraction * 0.5) / reverseI,
      averageGardenYieldPercentage:
        existingGardenValuesForTimestamp?.averageGardenYieldPercentage ??
        config.defaultAverageGardenYieldPercentage,
      timestamp,
    };
  });
}

export default GardenWalletsPanel;
