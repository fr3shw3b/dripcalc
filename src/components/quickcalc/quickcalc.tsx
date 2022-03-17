import { Button, InputGroup, Position } from "@blueprintjs/core";
import { Popover2, Tooltip2 } from "@blueprintjs/popover2";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useScreenSizeCheck from "../../hooks/use-screen-size-check";
import { AppState } from "../../store/types";
import formatCurrency from "../../utils/currency";

import "./quickcalc.css";

type Props = {
  forCalculator: "garden" | "faucet";
  currency: string;
};

function QuickCalc({ forCalculator, currency }: Props) {
  const isBelowThreshold = useScreenSizeCheck(950);

  const { tokenPrice } = useSelector((state: AppState) => ({
    tokenPrice:
      forCalculator === "garden"
        ? state.price.dripBUSDLPPriceInCurrency
        : state.price.nativeDexDripPriceInCurrency,
  }));

  const [tokenValue, setTokenValue] = useState(1);
  const [fiatValue, setFIATValue] = useState(tokenValue * tokenPrice);
  const [showPopover, setShowPopover] = useState(false);

  useEffect(() => {
    // Reset token value when the calculator changes.
    setTokenValue(1);
  }, [forCalculator]);

  useEffect(() => {
    setFIATValue(tokenValue * tokenPrice);
  }, [tokenValue, tokenPrice]);

  useEffect(() => {
    if (!isBelowThreshold) {
      setShowPopover(false);
    }
  }, [isBelowThreshold]);

  const handleTokenValueChange: React.ChangeEventHandler<HTMLInputElement> = (
    evt
  ) => {
    setTokenValue(Number.parseFloat(evt.currentTarget.value));
  };

  const renderQuickCalcInPopover = () => {
    return (
      <div className="quickcalc-popover-inner">
        <div className="quickcalc-popover-description">
          Convert {tokenLabels[forCalculator]} to {currency} at current price
        </div>
        <InputGroup
          id="quickcalc-input"
          type="number"
          className="quickcalc-input-group-popover"
          step={0.1}
          small
          asyncControl={true}
          min={0}
          leftElement={
            <div className="quickcalc-inline">
              {tokenLabelsShort[forCalculator]}
            </div>
          }
          placeholder={`Enter amount of ${tokenLabels[forCalculator]} tokens`}
          value={`${tokenValue ?? 0}`}
          onChange={handleTokenValueChange}
        />
        <div className="quickcalc-fiat-value-popover">
          {!Number.isNaN(fiatValue) ? (
            formatCurrency(currency, fiatValue)
          ) : (
            <div className="bp3-skeleton">
              {formatCurrency(currency, fiatValue)}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="quickcalc-container">
      <div className="quickcalc-inner">
        <Popover2
          content={renderQuickCalcInPopover()}
          className="quickcalc-popover"
          isOpen={showPopover}
          onClose={() => setShowPopover(false)}
        >
          <Button
            className="quickcalc-minimised-icon"
            icon="calculator"
            onClick={() => setShowPopover((prevState) => !prevState)}
          />
        </Popover2>
        <Tooltip2
          content={`Convert ${tokenLabels[forCalculator]} to ${currency} at current price`}
          position={Position.BOTTOM}
          className="quickcalc-tooltip"
          openOnTargetFocus={false}
        >
          <InputGroup
            id="quickcalc-input"
            type="number"
            className="quickcalc-input-group"
            step={0.1}
            small
            asyncControl={true}
            min={0}
            leftElement={
              <div className="quickcalc-inline">
                {tokenLabelsShort[forCalculator]}
              </div>
            }
            placeholder={`Enter amount of ${tokenLabels[forCalculator]} tokens`}
            value={`${tokenValue ?? 0}`}
            onChange={handleTokenValueChange}
          />
        </Tooltip2>
        <div className="quickcalc-fiat-value">
          {!Number.isNaN(fiatValue) ? (
            formatCurrency(currency, fiatValue)
          ) : (
            <div className="bp3-skeleton">
              {formatCurrency(currency, fiatValue)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const tokenLabels = {
  garden: "DRIP/BUSD LP",
  faucet: "DRIP",
};

const tokenLabelsShort = {
  garden: "LP",
  faucet: "DRIP",
};

export default QuickCalc;
