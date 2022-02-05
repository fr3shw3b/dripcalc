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

  const walletEarnings = calculatedEarnings.walletEarnings[walletId];

  if (!walletEarnings) {
    return undefined;
  }

  const { yearEarnings: yearEarningsMap } = walletEarnings;

  const lastYearEarnings = Object.values(yearEarningsMap).find(
    (yearEarnings) => yearEarnings.lastYear
  );

  if (!lastYearEarnings) {
    return undefined;
  }

  const monthKeys = Object.keys(lastYearEarnings.monthEarnings).filter(
    (monthKey) =>
      lastYearEarnings.monthEarnings[Number.parseInt(monthKey)].monthEarnings >
      0
  );
  monthKeys.sort((a, b) => Number.parseInt(a) - Number.parseInt(b));

  const month = Number.parseInt(monthKeys[monthKeys.length - 1]);
  const daysInMonth = getDaysInMonth(
    moment(`1/${month + 1}/${lastYearEarnings.year}`, "D/M/YYYY").toDate()
  );
  return Number.parseInt(
    moment(
      `${daysInMonth}/${month + 1}/${lastYearEarnings.year}`,
      "D/M/YYYY"
    ).format("x"),
    10
  );
}
