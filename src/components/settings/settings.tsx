import { FormGroup, HTMLSelect, InputGroup } from "@blueprintjs/core";
import React, { useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import ContentContext from "../../contexts/content";
import type { TrendPeriod } from "../../services/drip-value-provider";
import {
  updateDripValueTrend,
  updateCurrency,
  updateUptrendMaxValueChange,
  updateDowntrendMinValueChange,
  updateStabilisesAt,
  updateAverageGasFee,
  updateClaimDays,
  updateTrendPeriod,
} from "../../store/actions/settings";
import { AppState } from "../../store/types";

import "./settings.css";

function Settings() {
  const dispatch = useDispatch();
  const { settings } = useContext(ContentContext);
  const {
    dripValueTrend,
    currency,
    downtrendMinValue,
    uptrendMaxValue,
    stabilisesAt,
    averageGasFee,
    claimDays,
    trendPeriod,
    currentPlanId,
  } = useSelector((state: AppState) => {
    const currentPlanId = state.plans.current;
    return { ...state.settings[currentPlanId], currentPlanId };
  });

  const handleSelectTrend: React.ReactEventHandler<HTMLSelectElement> = (
    evt
  ) => {
    dispatch(updateDripValueTrend(evt.currentTarget.value, currentPlanId));
  };

  const handleSelectCurrency: React.ReactEventHandler<HTMLSelectElement> = (
    evt
  ) => {
    dispatch(
      updateCurrency(evt.currentTarget.value as "$" | "£" | "€", currentPlanId)
    );
  };

  const handleUptrendMaxValueChange: React.ChangeEventHandler<
    HTMLInputElement
  > = (evt) => {
    dispatch(
      updateUptrendMaxValueChange(
        Number.parseFloat(evt.currentTarget.value),
        currentPlanId
      )
    );
  };

  const handleDowntrendMinValueChange: React.ChangeEventHandler<
    HTMLInputElement
  > = (evt) => {
    dispatch(
      updateDowntrendMinValueChange(
        Number.parseFloat(evt.currentTarget.value),
        currentPlanId
      )
    );
  };

  const handleStabilisesAtChange: React.ChangeEventHandler<HTMLInputElement> = (
    evt
  ) => {
    dispatch(
      updateStabilisesAt(
        Number.parseFloat(evt.currentTarget.value),
        currentPlanId
      )
    );
  };

  const handleAverageGasFeeChange: React.ChangeEventHandler<
    HTMLInputElement
  > = (evt) => {
    dispatch(
      updateAverageGasFee(
        Number.parseFloat(evt.currentTarget.value),
        currentPlanId
      )
    );
  };

  const handleSelectClaimDays: React.ReactEventHandler<HTMLSelectElement> = (
    evt
  ) => {
    dispatch(updateClaimDays(evt.currentTarget.value, currentPlanId));
  };

  const handleSelectTrendPeriod: React.ReactEventHandler<HTMLSelectElement> = (
    evt
  ) => {
    dispatch(
      updateTrendPeriod(evt.currentTarget.value as TrendPeriod, currentPlanId)
    );
  };

  return (
    <div className="settings-wrapper">
      <form className="settings-form" onSubmit={(evt) => evt.preventDefault()}>
        <FormGroup
          helperText={settings.currencyHelpText}
          label={settings.currencyLabel}
          labelFor="currency-select"
        >
          <HTMLSelect
            id="currency-select"
            value={currency}
            onChange={handleSelectCurrency}
          >
            {Object.entries(settings.currencies).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </HTMLSelect>
        </FormGroup>
        <FormGroup
          helperText={settings.dripValueTrendHelpText}
          label={settings.dripValueTrendLabel}
          labelFor="trend-select"
        >
          <HTMLSelect
            id="trend-select"
            value={dripValueTrend}
            onChange={handleSelectTrend}
          >
            {Object.entries(settings.dripValueTrendOptions).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </HTMLSelect>
        </FormGroup>
        {dripValueTrend === "uptrend" && (
          <FormGroup
            helperText={settings.uptrendMaxValueHelpText(
              settings.currencies[currency]
            )}
            label={settings.uptrendMaxValueLabel}
            labelFor="uptrend-max-value"
          >
            <InputGroup
              id="uptrend-max-value"
              type="number"
              asyncControl={true}
              leftElement={<div className="currency-inline">{currency}</div>}
              placeholder="Enter maximum value"
              value={uptrendMaxValue?.toFixed(2) ?? 0}
              onChange={handleUptrendMaxValueChange}
            />
          </FormGroup>
        )}
        {dripValueTrend === "downtrend" && (
          <FormGroup
            helperText={settings.downTrendMinValueHelpText(
              settings.currencies[currency]
            )}
            label={settings.downtrendMinValueLabel}
            labelFor="downtrend-min-value"
          >
            <InputGroup
              id="downtrend-min-value"
              type="number"
              asyncControl={true}
              leftElement={<div className="currency-inline">{currency}</div>}
              placeholder="Enter minimum value"
              value={downtrendMinValue?.toFixed(2) ?? 0}
              onChange={handleDowntrendMinValueChange}
            />
          </FormGroup>
        )}
        {dripValueTrend === "stable" && (
          <FormGroup
            helperText={settings.stabilisesAtHelpText(
              settings.currencies[currency]
            )}
            label={settings.stabilisesAtLabel}
            labelFor="stable-value"
          >
            <InputGroup
              id="stable-value"
              type="number"
              asyncControl={true}
              leftElement={<div className="currency-inline">{currency}</div>}
              placeholder="Enter value DRIP stabilises at"
              value={stabilisesAt?.toFixed(2) ?? 0}
              onChange={handleStabilisesAtChange}
            />
          </FormGroup>
        )}
        <FormGroup
          helperText={settings.trendPeriodHelpText}
          label={settings.trendPeriodLabel}
          labelFor="trend-period-select"
        >
          <HTMLSelect
            id="trend-period-select"
            value={trendPeriod}
            onChange={handleSelectTrendPeriod}
          >
            {Object.entries(settings.trendPeriods).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </HTMLSelect>
        </FormGroup>
        <FormGroup
          helperText={settings.averageGasFeeHelpText(currency)}
          label={settings.averageGasFeeLabel}
          labelFor="average-gas-fee"
        >
          <InputGroup
            id="average-gas-fee"
            type="number"
            asyncControl={true}
            leftElement={<div className="currency-inline">{currency}</div>}
            placeholder="Enter average gas fee"
            value={averageGasFee?.toFixed(2) ?? 0}
            onChange={handleAverageGasFeeChange}
          />
        </FormGroup>
        <FormGroup
          helperText={settings.claimDaysHelpText}
          label={settings.claimDaysLabel}
          labelFor="claim-days-select"
        >
          <HTMLSelect
            id="claim-days-select"
            value={claimDays}
            onChange={handleSelectClaimDays}
          >
            {Object.entries(settings.claimDays).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </HTMLSelect>
        </FormGroup>
      </form>
    </div>
  );
}

export default Settings;
