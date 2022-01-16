import { Callout, Intent } from "@blueprintjs/core";
import "./information.css";

/**
 * This component does not use the content context
 * as it is purely text content for information purposes!
 *
 * In the future it might be worth moving all info to the content context.
 */
function Information() {
  return (
    <div className="block information-content">
      <Callout intent={Intent.WARNING}>
        <strong>
          None of the information, tips or help provided in this tool is
          financial advice. Do your own research before investing in the DRIP
          network!
        </strong>
      </Callout>
      <p className="info-content-block">
        <strong>Max Payout Cap (DRIP):</strong> 100,0000
        <br />
        <strong>Hydrate Tax:</strong> 5%
        <br />
        <strong>Deposit Tax:</strong> 10%
        <br />
        <strong>Claim Tax:</strong> 10%
      </p>
      <p className="block">
        <ul className="information-content-list">
          <li>
            <strong>
              <a href="https://drip.community" target="_blank" rel="noreferrer">
                DRIP Community Site
              </a>
            </strong>
          </li>
          <li>
            <strong>
              <a
                href="https://drip.community/docs/DRIP_LIGHTPAPER_v0.8_Lit_Version.pdf"
                target="_blank"
                rel="noreferrer"
              >
                Light Paper
              </a>
            </strong>
          </li>
          <li>
            <strong>Whale tax is included in the dripcalc calculations!</strong>
          </li>
          <li>
            <strong>
              <a
                href="https://dripcommunity.org/drip-guide/understanding-drip-whale-tax/"
                target="_blank"
                rel="noreferrer"
              >
                Information about Whale Tax
              </a>
            </strong>
          </li>
        </ul>
      </p>
      <p className="info-content-block">
        Depositing in the faucet is NOT staking! You get your tokens back in the
        form of the 1% daily drip. Deposit balance is not asset value but
        instead a measure of the cash flow through daily 1% drip (3.65 x deposit
        balance)
      </p>
    </div>
  );
}

export default Information;
