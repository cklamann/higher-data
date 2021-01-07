import { ChartExportDataParentModel } from "../../../../../../server/src/modules/ChartExporter";
import { FormulaParserResult } from "../../../../../../server/src/modules/FormulaParser";
import * as _ from "lodash";
import * as d3 from "d3";

export class ChartData {
  data: BaseChartData[];
  constructor(data: ChartExportDataParentModel[]) {
    this.data = _baseTransform(data);
  }

  sortByVal = (flag) => {
    this.data.forEach((datum) => datum.data.sort(_numSort));
    if (flag == "desc") {
      this.data.forEach((datum) => datum.data.reverse());
    }
  };

  getMax = (): number =>
    d3.max(this.data, (datum) => d3.max(datum.data, (item) => item.value));
  getMin = (): number =>
    d3.min(this.data, (datum) => d3.min(datum.data, (item) => item.value));
  getTotal = (): number =>
    d3.sum(this.data, (varGroup) => this.sum(varGroup.data));

  sum = (variables: BaseChartDatum[]) =>
    variables.reduce((a, b) => {
      return a + b.value;
    }, 0);

  getDateRange = (): Array<Date> => {
    let range = _.flatMap(this.data, (c) =>
      _.flatMap(c.data, (d) => d.fiscal_year)
    );
    return _.uniqBy(range, (item) => item.getFullYear()).sort((a, b) =>
      a > b ? 1 : -1
    );
  };

  getSumForYear = (year: Date): number => {
    const everything = _.flatMap(this.data, (datum) => datum.data),
      forYear = everything.filter(
        (item) => item.fiscal_year.getFullYear() === year.getFullYear()
      ),
      sum = forYear.reduce((a, b) => a + b.value, 0);
    return sum;
  };

  setNullsToZero = (): void =>
    this.data.forEach((datum) =>
      datum.data.forEach((item) =>
        item.value === null ? (item.value = 0) : (item.value = item.value)
      )
    );

  //loops through variables and any variable missing years gets zeroes
  //needed for area chart
  setMissingValsToZero = () => {
    let dateRange = this.getDateRange();
    this.data.forEach((datum) => {
      let diff = _.differenceBy(
          dateRange,
          datum.data.map((item) => item.fiscal_year),
          (item) => item.getFullYear()
        ),
        filler = diff.map((date) => {
          return {
            fiscal_year: date,
            value: 0,
            legendName: datum.legendName,
            key: datum.key,
          };
        });
      if (!_.isEmpty(filler)) datum.data = datum.data.concat(filler);
      datum.data.sort(_dateSort);
    });
  };

  removeDatum = (index) =>
    (this.data = this.data.filter((val, i) => i != index));
}

export interface BaseChartData extends ChartExportDataParentModel {
  legendName: string;
  key: string;
  d3Key?: string;
  data: BaseChartDatum[];
}

export interface BaseChartDatum extends FormulaParserResult {
  legendName: string;
  value: number;
  fiscal_year: any;
  key: string;
}

function _baseTransform(data: ChartExportDataParentModel[]): BaseChartData[] {
  return (
    data
      //any b/c of intermediate data type
      .map((variable: any) => {
        variable.key = variable.data.length ? variable.data[0].key : "";
        return variable;
      })
      .filter((datum) => datum.data.length > 0)
  );
}

function _numSort(a, b) {
  if (a.value < b.value) return -1;
  if (a.value > b.value) return 1;
  return 0;
}

function _dateSort(a, b) {
  if (a.fiscal_year.getFullYear() < b.fiscal_year.getFullYear()) return -1;
  if (a.fiscal_year.getFullYear() > b.fiscal_year.getFullYear()) return 1;
  return 0;
}
