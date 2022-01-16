import moment from "moment";
import { EarningsAndInfo } from "../store/middleware/shared-calculator-types";
import { getDaysInMonth } from "./date";

export function findLastYearForWallet(
  walletId: string,
  calculatedEarnings?: EarningsAndInfo
): number | undefined {
  if (!calculatedEarnings) {
    return undefined;
  }

  const { yearEarnings: yearEarningsMap } =
    calculatedEarnings.walletEarnings[walletId];

  const lastYearEarnings = Object.values(yearEarningsMap).find(
    (yearEarnings) => yearEarnings.lastYear
  );

  if (!lastYearEarnings) {
    return undefined;
  }

  const monthKeys = Object.keys(lastYearEarnings.monthEarnings);
  monthKeys.sort();

  const month = monthKeys[monthKeys.length - 1];
  const daysInMonth = getDaysInMonth(
    moment(`1/${month}/${lastYearEarnings.year}`, "D/M/YYYY").toDate()
  );
  return Number.parseInt(
    moment(
      `${daysInMonth}/${month}/${lastYearEarnings.year}`,
      "D/M/YYYY"
    ).format("x"),
    10
  );
}
