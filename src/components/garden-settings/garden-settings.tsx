import { FormGroup, HTMLSelect, InputGroup } from "@blueprintjs/core";
import React, { useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import ContentContext from "../../contexts/content";
import type { TrendPeriod } from "../../services/token-value-provider";
import {
  updateDripBUSDLPValueTrend,
  updateCurrency,
  updateDripBUSDLPUptrendMaxValueChange,
  updateDripBUSDLPDowntrendMinValueChange,
  updateGardenAverageGasFee,
  updateGardenHarvestDays,
  updateGardenTrendPeriod,
  updateGardenSowFrequency,
  updateDripBUSDLPStabilisesAt,
  updateGardenLastYear,
  updateGardenAverageDepositGasFee,
} from "../../store/actions/settings";
import { SowFrequency } from "../../store/reducers/settings";
import { AppState } from "../../store/types";

import "./garden-settings.css";

function GardenSettings() {
  const dispatch = useDispatch();
  const { settings } = useContext(ContentContext);
  const {
    dripBUSDLPValueTrend,
    currency,
    dripBUSDLPDowntrendMinValue,
    dripBUSDLPUptrendMaxValue,
    dripBUSDLPStabilisesAt,
    gardenAverageGasFee,
    gardenHarvestDays,
    gardenTrendPeriod,
    gardenLastYear,
    currentPlanId,
    defaultGardenSowFrequency,
    gardenAverageDepositGasFee,
  } = useSelector((state: AppState) => {
    const currentPlanId = state.plans.current;
    return { ...state.settings[currentPlanId], currentPlanId };
  });

  const handleSelectTrend: React.ReactEventHandler<HTMLSelectElement> = (
    evt
  ) => {
    dispatch(
      updateDripBUSDLPValueTrend(evt.currentTarget.value, currentPlanId)
    );
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
      updateDripBUSDLPUptrendMaxValueChange(
        Number.parseFloat(evt.currentTarget.value),
        currentPlanId
      )
    );
  };

  const handleDowntrendMinValueChange: React.ChangeEventHandler<
    HTMLInputElement
  > = (evt) => {
    dispatch(
      updateDripBUSDLPDowntrendMinValueChange(
        Number.parseFloat(evt.currentTarget.value),
        currentPlanId
      )
    );
  };

  const handleStabilisesAtChange: React.ChangeEventHandler<HTMLInputElement> = (
    evt
  ) => {
    dispatch(
      updateDripBUSDLPStabilisesAt(
        Number.parseFloat(evt.currentTarget.value),
        currentPlanId
      )
    );
  };

  const handleAverageGasFeeChange: React.ChangeEventHandler<
    HTMLInputElement
  > = (evt) => {
    dispatch(
      updateGardenAverageGasFee(
        Number.parseFloat(evt.currentTarget.value),
        currentPlanId
      )
    );
  };

  const handleAverageDepositGasFeeChange: React.ChangeEventHandler<
    HTMLInputElement
  > = (evt) => {
    dispatch(
      updateGardenAverageDepositGasFee(
        Number.parseFloat(evt.currentTarget.value),
        currentPlanId
      )
    );
  };

  const handleSelectHarvestDays: React.ReactEventHandler<HTMLSelectElement> = (
    evt
  ) => {
    dispatch(updateGardenHarvestDays(evt.currentTarget.value, currentPlanId));
  };

  const handleSelectTrendPeriod: React.ReactEventHandler<HTMLSelectElement> = (
    evt
  ) => {
    dispatch(
      updateGardenTrendPeriod(
        evt.currentTarget.value as TrendPeriod,
        currentPlanId
      )
    );
  };

  const handleSelectDefaultGardenSowFrequency: React.ReactEventHandler<
    HTMLSelectElement
  > = (evt) => {
    dispatch(
      updateGardenSowFrequency(
        evt.currentTarget.value as SowFrequency,
        currentPlanId
      )
    );
  };

  const handleSelectGardenLastYear: React.ReactEventHandler<
    HTMLSelectElement
  > = (evt) => {
    dispatch(
      updateGardenLastYear(
        Number.parseInt(evt.currentTarget.value),
        currentPlanId
      )
    );
  };

  return (
    <div className="garden-settings-wrapper">
      <form
        className="garden-settings-form"
        onSubmit={(evt) => evt.preventDefault()}
      >
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
          helperText={settings.gardenValueTrendHelpText}
          label={settings.gardenValueTrendLabel}
          labelFor="trend-select"
        >
          <HTMLSelect
            id="trend-select"
            value={dripBUSDLPValueTrend}
            onChange={handleSelectTrend}
          >
            {Object.entries(settings.gardenValueTrendOptions).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </HTMLSelect>
        </FormGroup>
        {dripBUSDLPValueTrend === "uptrend" && (
          <FormGroup
            helperText={settings.gardenUptrendMaxValueHelpText(
              settings.currencies[currency]
            )}
            label={settings.gardenUptrendMaxValueLabel}
            labelFor="uptrend-max-value"
          >
            <InputGroup
              id="uptrend-max-value"
              type="number"
              asyncControl={true}
              leftElement={<div className="currency-inline">{currency}</div>}
              placeholder="Enter maximum value"
              value={`${dripBUSDLPUptrendMaxValue}` ?? 0}
              onChange={handleUptrendMaxValueChange}
            />
          </FormGroup>
        )}
        {dripBUSDLPValueTrend === "downtrend" && (
          <FormGroup
            helperText={settings.gardenDownTrendMinValueHelpText(
              settings.currencies[currency]
            )}
            label={settings.gardenDowntrendMinValueLabel}
            labelFor="downtrend-min-value"
          >
            <InputGroup
              id="downtrend-min-value"
              type="number"
              asyncControl={true}
              leftElement={<div className="currency-inline">{currency}</div>}
              placeholder="Enter minimum value"
              value={`${dripBUSDLPDowntrendMinValue}` ?? 0}
              onChange={handleDowntrendMinValueChange}
            />
          </FormGroup>
        )}
        {dripBUSDLPValueTrend === "stable" && (
          <FormGroup
            helperText={settings.gardenStabilisesAtHelpText(
              settings.currencies[currency]
            )}
            label={settings.gardenStabilisesAtLabel}
            labelFor="stable-value"
          >
            <InputGroup
              id="stable-value"
              type="number"
              asyncControl={true}
              leftElement={<div className="currency-inline">{currency}</div>}
              placeholder="Enter value DRIP/BUSD LP stabilises at"
              value={`${dripBUSDLPStabilisesAt}` ?? 0}
              onChange={handleStabilisesAtChange}
            />
          </FormGroup>
        )}
        <FormGroup
          helperText={settings.gardenTrendPeriodHelpText}
          label={settings.gardenTrendPeriodLabel}
          labelFor="trend-period-select"
        >
          <HTMLSelect
            id="trend-period-select"
            value={gardenTrendPeriod}
            onChange={handleSelectTrendPeriod}
          >
            {Object.entries(settings.gardenTrendPeriods).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </HTMLSelect>
        </FormGroup>
        <FormGroup
          helperText={settings.gardenAverageGasFeeHelpText(currency)}
          label={settings.gardenAverageGasFeeLabel}
          labelFor="average-gas-fee"
        >
          <InputGroup
            id="average-gas-fee"
            type="number"
            asyncControl={true}
            leftElement={<div className="currency-inline">{currency}</div>}
            placeholder="Enter average garden gas fee"
            value={`${gardenAverageGasFee}` ?? 0}
            onChange={handleAverageGasFeeChange}
          />
        </FormGroup>
        <FormGroup
          helperText={settings.gardenAverageDepositGasFeeHelpText(currency)}
          label={settings.gardenAverageDepositGasFeeLabel}
          labelFor="average-deposit-gas-fee"
        >
          <InputGroup
            id="average-deposit-gas-fee"
            type="number"
            asyncControl={true}
            leftElement={<div className="currency-inline">{currency}</div>}
            placeholder="Enter average garden deposit gas fee"
            value={`${gardenAverageDepositGasFee}` ?? 0}
            onChange={handleAverageDepositGasFeeChange}
          />
        </FormGroup>
        <FormGroup
          helperText={settings.gardenHarvestDaysHelpText}
          label={settings.gardenHarvestDaysLabel}
          labelFor="harvest-days-select"
        >
          <HTMLSelect
            id="harvest-days-select"
            value={gardenHarvestDays}
            onChange={handleSelectHarvestDays}
          >
            {Object.entries(settings.gardenHarvestDays).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </HTMLSelect>
        </FormGroup>
        <FormGroup
          helperText={settings.defaultGardenSowFrequencyHelpText}
          label={settings.defaultGardenSowFrequencyLabel}
          labelFor="default-sow-frequency-select"
        >
          <HTMLSelect
            id="default-sow-frequency-select"
            value={defaultGardenSowFrequency}
            onChange={handleSelectDefaultGardenSowFrequency}
          >
            {Object.entries(settings.defaultGardenSowFrequencies).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </HTMLSelect>
        </FormGroup>
        <FormGroup
          helperText={settings.gardenLastYearHelpText}
          label={settings.gardenLastYearLabel}
          labelFor="garden-last-year-select"
        >
          <HTMLSelect
            id="garden-last-year-select"
            value={gardenLastYear}
            onChange={handleSelectGardenLastYear}
          >
            {nextNYears(new Date(), 30).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </HTMLSelect>
        </FormGroup>
      </form>
    </div>
  );
}

function nextNYears(fromDate: Date, years: number): number[] {
  const startYear = fromDate.getFullYear();
  return [...Array(years)].map((_, i) => startYear + i);
}

export default GardenSettings;
