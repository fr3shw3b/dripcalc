import { VictoryTheme, VictoryThemeDefinition } from "victory";
import type { VictoryLabelStyleObject } from "victory-core";

const chartTheme: VictoryThemeDefinition = {
  ...VictoryTheme.material,
  legend: {
    ...VictoryTheme.material.legend,
    style: {
      ...VictoryTheme.material.legend?.style,
      labels: {
        ...(VictoryTheme.material.legend?.style
          ?.labels as VictoryLabelStyleObject),
        fontFamily: "Lato, sans-serif",
        fontSize: 9,
        fill: "#eeeeee",
      },
    },
  },
  line: {
    ...VictoryTheme.material.line,
    style: {
      ...VictoryTheme.material.line?.style,
      labels: {
        ...(VictoryTheme.material.line?.style
          ?.labels as VictoryLabelStyleObject),
        fill: "#eeeeee",
        fontFamily: "Lato, sans-serif",
        fontSize: 9,
      },
    },
  },
  axis: {
    ...VictoryTheme.material.axis,
    style: {
      ...VictoryTheme.material.axis?.style,
      grid: {
        ...VictoryTheme.material.axis?.style?.grid,
        stroke: "#888888",
      },
      tickLabels: {
        // this changed the color of my numbers to white
        fill: "#eeeeee",
        fontFamily: "Lato, sans-serif",
        fontSize: "10px",
      },
    },
  },
};

export default chartTheme;
