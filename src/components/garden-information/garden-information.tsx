import { Callout, Icon, Intent } from "@blueprintjs/core";
import "./garden-information.css";

/**
 * This component does not use the content context
 * as it is purely text content for information purposes!
 *
 * In the future it might be worth moving all info to the content context.
 */
function GardenInformation() {
  return (
    <div className="block information-content">
      <Callout intent={Intent.WARNING}>
        <strong>
          None of the information, tips or help provided in this tool is
          financial advice. Do your own research before investing in the
          DRIP/BUSD LP garden!
        </strong>
      </Callout>
      <p className="info-content-block">
        <strong>Seeds per plant:</strong> 2,592,000 <br />
        <i>(This rate is fixed in the contract)</i>
        <br />
        <br />
        <strong>Seeds produced a day per plant:</strong> 86,400 <br />
        <i>
          (This rate fluctuates based on your habits and those of the wider
          community of gardeners)
        </i>
      </p>
      <p className="block">
        <ul className="information-content-list">
          <li>
            <strong>
              <a
                href="https://theanimal.farm/garden"
                target="_blank"
                rel="noreferrer"
              >
                DRIP/BUSD Garden Site
              </a>
            </strong>
          </li>
          <li>
            <strong>
              <a
                href="https://theanimal.farm/docs/The_Animal_Farm_Whitepaper.pdf"
                target="_blank"
                rel="noreferrer"
              >
                White Paper
              </a>
            </strong>
          </li>
        </ul>
      </p>
      <p className="info-content-block">
        Depositing into the garden by buying plants is NOT staking in the sense
        that you would expect to be able to withdraw your investment after a
        certain amount of time! When you buy plants, you give up your tokens for
        daily rewards. You get your tokens back in the form of the up to 3%
        daily seeds rewards. Deposit balance is not asset value but instead a
        measure for your daily rewards.
      </p>
      <p className="info-content-block">
        <h3>Calculator DRIP/BUSD LP values for each day</h3>
        <p>
          The garden calculator uses weighted randomisation to select the value
          of DRIP/BUSD LP for each day that is ultimately heading in the
          direction of the trend that you configure in settings. A range of 15%
          variance is applied, 7.5% in each direction. For this reason every
          time you refresh the calculations, the values of earnings will differ.
        </p>
      </p>
      <p className="info-content-block">
        <h3>About harvesting (claiming)</h3>
        <p>
          This calculator assumes you will harvest the % that is not reinvested
          once a month. For example, if you are re-investing 70% in January and
          your harvest days are at the end of the month you will stop sowing
          (compounding) on the 23rd and claim the rewards for the rest of the
          month.
        </p>
      </p>
      <p className="info-content-block">
        <h3>About government tax</h3>
        All the fiat currency values in the earnings calculated are before
        government tax, it's down to you to figure that out given your
        circumstances!
      </p>
    </div>
  );
}

export default GardenInformation;
