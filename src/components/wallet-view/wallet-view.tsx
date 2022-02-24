import { useContext } from "react";
import { Button, Tab, Tabs } from "@blueprintjs/core";

import { DayActionValue, MonthInput } from "../../store/reducers/plans";
import ContentContext, { WalletsContent } from "../../contexts/content";
import MomentDateRange from "../moment-date-range";

import "./wallet-view.css";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../store/types";

import MonthlyWalletPanel from "../monthly-wallet-panel";
import YearlyWalletPanel from "../yearly-wallet-panel";
import HydrateClaimStrategyPanel from "../hydrate-claim-strategy-panel";
import { Popover2 } from "@blueprintjs/popover2";
import { findLastYearForWallet } from "../../utils/wallets";
import useMobileCheck from "../../hooks/use-mobile-check";
import { EarningsAndInfo } from "../../store/middleware/shared-calculator-types";
import moment from "moment";
import { GeneralState } from "../../store/reducers/general";
import GardenMonthlyWalletPanel from "../garden-monthly-wallet-panel";
import GardenStrategyPanel from "../garden-strategy-panel";
import { updateWalletMonthInputs } from "../../store/actions/plans";
import GardenYearlyWalletPanel from "../garden-yearly-wallet-panel";

type Props = {
  walletId: string;
  label: string;
  startDate: number;
  monthInputs: Record<string, MonthInput>;
  editMode: boolean;
  forCalculator: "garden" | "faucet";
  fiatMode: boolean;
  onEditClick?: (walletId: string) => void;
  onDepositsClick: (walletId: string) => void;
  onReinvestmentPlanClick: (walletId: string) => void;
  onCustomValuesClick: (walletId: string) => void;
};

function WalletView({
  walletId,
  label,
  startDate,
  monthInputs,
  editMode,
  forCalculator,
  fiatMode,
  onEditClick,
  onDepositsClick,
  onReinvestmentPlanClick,
  onCustomValuesClick,
}: Props) {
  const dispatch = useDispatch();
  const isMobile = useMobileCheck();
  const { wallets: walletsContent } = useContext(ContentContext);
  const { isCalculating, calculatedEarnings, currentPlanId, gardenLastYear } =
    useSelector(
      (
        state: AppState
      ): GeneralState & { gardenLastYear: number; currentPlanId: string } => ({
        ...state.general,
        gardenLastYear: state.settings[state.plans.current].gardenLastYear,
        currentPlanId: state.plans.current,
      })
    );

  const handleEditClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    if (onEditClick) {
      onEditClick(walletId);
    }
  };

  const handleDepositsClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    onDepositsClick(walletId);
  };

  const handleReinvestmentPlanClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    onReinvestmentPlanClick(walletId);
  };

  const handleCustomValuesClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    onCustomValuesClick(walletId);
  };

  const handleSaveActionForDayOverride = (
    timestamp: number,
    dayActionValue: DayActionValue
  ) => {
    dispatch(
      updateWalletMonthInputs(
        walletId,
        currentPlanId,
        updateMonthInputsDayAction(timestamp, dayActionValue, monthInputs)
      )
    );
  };

  const endDate = getWalletEndDate(
    walletId,
    new Date(startDate),
    forCalculator,
    gardenLastYear,
    calculatedEarnings[currentPlanId]
  );

  const {
    depositsButtonText,
    reinvestButtonText,
    customValueButtonText,
    helpText,
  } = determineTextForCalculator(forCalculator, walletsContent, fiatMode);

  const MonthlyWalletPanelComp =
    forCalculator === "garden" ? GardenMonthlyWalletPanel : MonthlyWalletPanel;

  const StrategyPanel =
    forCalculator === "garden"
      ? GardenStrategyPanel
      : HydrateClaimStrategyPanel;

  const YearlyWalletPanelComp =
    forCalculator === "garden" ? GardenYearlyWalletPanel : YearlyWalletPanel;

  return (
    <div className="wallet-view-container">
      <h2 className="wallet-heading">{label} </h2>
      <div className={`wallet-ctas`}>
        {editMode && <Button icon="edit" small onClick={handleEditClick} />}
        <Button
          className="wallet-heading-cta"
          icon="bank-account"
          small
          onClick={handleDepositsClick}
          text={isMobile ? "" : depositsButtonText}
        />
        <Button
          className="wallet-heading-cta"
          icon="percentage"
          small
          onClick={handleReinvestmentPlanClick}
          text={isMobile ? "" : reinvestButtonText}
        />
        {(fiatMode || forCalculator === "garden") && (
          <Button
            className="wallet-heading-cta"
            icon="tint"
            small
            onClick={handleCustomValuesClick}
            text={isMobile ? "" : customValueButtonText}
          />
        )}
        <Popover2
          content={
            <div className="wallet-help-popover-content">{helpText}</div>
          }
          placement={isMobile ? "bottom" : "auto"}
          usePortal={false}
          modifiers={{
            arrow: { enabled: true },
            flip: { enabled: true },
            preventOverflow: { enabled: true },
          }}
        >
          <Button className="wallet-heading-cta" icon="help" small />
        </Popover2>
      </div>
      <div>
        <MomentDateRange
          className={`date-range${isCalculating ? " bp3-skeleton" : ""}`}
          range={[new Date(startDate), endDate]}
        />
        <div className="block">
          <Tabs
            id={`wallet-${walletId}-tabs`}
            className={isCalculating ? "bp3-skeleton" : ""}
          >
            <Tab
              id={`monthly-${walletId}`}
              title="Monthly"
              panel={<MonthlyWalletPanelComp walletId={walletId} />}
            />
            <Tab
              id={`yearly-${walletId}`}
              title="Yearly"
              panel={<YearlyWalletPanelComp walletId={walletId} />}
            />
            <Tab
              id={`hydrate-strategy-${walletId}`}
              title={
                forCalculator === "faucet"
                  ? "Hydrate & Claim Strategy"
                  : "Sow & Harvest Strategy"
              }
              panel={
                <StrategyPanel
                  walletId={walletId}
                  onSaveActionForDayOverride={handleSaveActionForDayOverride}
                />
              }
            />
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function getWalletEndDate(
  walletId: string,
  startDate: Date,
  forCalculator: "garden" | "faucet",
  lastYearForGarden?: number,
  earnings?: EarningsAndInfo
): Date {
  if (forCalculator === "faucet") {
    return new Date(findLastYearForWallet(walletId, earnings) ?? startDate);
  }
  return moment(`31/12/${lastYearForGarden}`, "DD/MM/YYYY").toDate();
}

type ButtonTextContent = {
  depositsButtonText: string;
  reinvestButtonText: string;
  customValueButtonText: string;
  helpText: React.ReactNode;
};

function determineTextForCalculator(
  forCalculator: "garden" | "faucet",
  walletsContent: WalletsContent,
  fiatMode: boolean
): ButtonTextContent {
  return {
    depositsButtonText:
      forCalculator === "garden"
        ? walletsContent.gardenDepositsButtonText
        : walletsContent.depositsButtonText,
    reinvestButtonText:
      forCalculator === "garden"
        ? walletsContent.gardenReinvestButtonText
        : walletsContent.reinvestButtonText,
    customValueButtonText:
      forCalculator === "garden"
        ? walletsContent.customDripBUSDLPValuesButtonText
        : walletsContent.customDripValuesButtonText,
    helpText:
      forCalculator === "garden"
        ? walletsContent.walletViewGardenHelpText(fiatMode)
        : walletsContent.walletViewHelpText(fiatMode),
  };
}

function updateMonthInputsDayAction(
  timestamp: number,
  dayActionValue: DayActionValue,
  monthInputs: Record<string, MonthInput>
): Record<string, MonthInput> {
  const dateKeyForTimestamp = moment(new Date(timestamp)).format("01/MM/YYYY");
  const monthInput = monthInputs[dateKeyForTimestamp];
  if (!monthInput) {
    return monthInputs;
  }

  const existingActionForDayIndex = (
    monthInput.customDayActions ?? []
  ).findIndex(
    ({ timestamp: candidateTimestamp }) => candidateTimestamp === timestamp
  );

  const customDayActions =
    existingActionForDayIndex > -1
      ? [
          ...(monthInput.customDayActions ?? []).slice(
            0,
            existingActionForDayIndex
          ),
          {
            timestamp,
            action: dayActionValue,
          },
          ...(monthInput.customDayActions ?? []).slice(
            existingActionForDayIndex + 1
          ),
        ]
      : [
          ...(monthInput.customDayActions ?? []),
          { timestamp, action: dayActionValue },
        ];

  return {
    ...monthInputs,
    [dateKeyForTimestamp]: {
      ...monthInput,
      customDayActions,
    },
  };
}

export default WalletView;
