import moment from "moment";

import { Intent, Tag } from "@blueprintjs/core";

const FORMAT = "dddd, LL";
const FORMAT_TIME = "dddd, LL LT";

type Props = {
  date: Date | null;
  format?: string;
  withTime?: boolean;
};

function MomentDate({
  date,
  withTime = false,
  format = withTime ? FORMAT_TIME : FORMAT,
}: Props) {
  const m = moment(date);
  if (m.isValid()) {
    return <Tag intent={Intent.PRIMARY}>{m.format(format)}</Tag>;
  } else {
    return <Tag minimal={true}>no date</Tag>;
  }
}

export default MomentDate;
