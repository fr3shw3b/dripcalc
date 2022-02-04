import classNames from "classnames";

import { Icon, Props as CoreProps } from "@blueprintjs/core";
import { DateRange } from "@blueprintjs/datetime";

import MomentDate from "../moment-date";
import useMobileCheck from "../../hooks/use-mobile-check";

const FORMAT = "dddd, LL";
const FORMAT_MOBILE = "LL";
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
  const isMobile = useMobileCheck();
  const finalFormat = isMobile ? FORMAT_MOBILE : format;
  return (
    <div className={classNames("docs-date-range", className)}>
      <MomentDate withTime={withTime} date={start} format={finalFormat} />
      <Icon icon="arrow-right" />
      <MomentDate withTime={withTime} date={end} format={finalFormat} />
    </div>
  );
}

export default MomentDateRange;
