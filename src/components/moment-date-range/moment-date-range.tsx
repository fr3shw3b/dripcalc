import classNames from "classnames";

import { Icon, Props as CoreProps } from "@blueprintjs/core";
import { DateRange } from "@blueprintjs/datetime";

import MomentDate from "../moment-date";

const FORMAT = "dddd, LL";
const FORMAT_TIME = "dddd, LL LT";

type Props = {
  range: DateRange;
  format?: string;
  withTime?: boolean;
} & CoreProps;

function MomentDateRange({
  className,
  range: [start, end],
  withTime = false,
  format = withTime ? FORMAT_TIME : FORMAT,
}: Props) {
  return (
    <div className={classNames("docs-date-range", className)}>
      <MomentDate withTime={withTime} date={start} format={format} />
      <Icon icon="arrow-right" />
      <MomentDate withTime={withTime} date={end} format={format} />
    </div>
  );
}

export default MomentDateRange;
