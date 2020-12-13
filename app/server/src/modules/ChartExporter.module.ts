import * as _ from "lodash";
import { SchoolModel } from "../schemas/SchoolSchema";
import { ChartModel, ChartVariableModel } from "../schemas/ChartSchema";
import {
  FormulaParser,
  intFormulaParserResult,
} from "../modules/FormulaParser.module";
import { getInflationAdjuster } from "../modules/InflationAdjuster.service";

export interface ChartExport {
  chart: ChartModel;
  school: SchoolModel;
  data: ChartExportDataParentModel[];
  options: ChartExportOptions;
}

export interface ChartExportDataParentModel {
  legendName: string;
  data: intFormulaParserResult[];
}

export interface ChartExportOptions {
  cut?: string;
  inflationAdjusted?: string;
}

export class ChartExporter {
  constructor(
    public school: SchoolModel,
    public chart: ChartModel,
    private options: ChartExportOptions = {}
  ) {
    if (this.options.cut) {
      this.chart.variables = this.chart.variables.map((vari) => {
        vari.formula = "(" + vari.formula + ")" + "/(" + this.options.cut + ")";
        return vari;
      });
    }
  }

  public export(): Promise<ChartExport> {
    let promises = this.chart.variables.map((variable: ChartVariableModel) => {
      let varVal = new FormulaParser(variable.formula);
      return varVal.execute(this.school.unitid);
    });
    return Promise.all(promises)
      .then((values) => {
        if (this.options.inflationAdjusted == "true") {
          let promises = values.map((value) => this._adjustForInflation(value));
          return Promise.all(promises);
        } else return values;
      })
      .then((values) => {
        return values.map((result, i) => {
          return {
            legendName: this.chart.variables[i].legendName,
            data: result,
          };
        });
      })
      .then((data) => {
        return {
          chart: this.chart,
          school: this.school,
          data: data,
          options: this.options,
        };
      });
  }
  _adjustForInflation(
    res: intFormulaParserResult[]
  ): Promise<intFormulaParserResult[]> {
    return getInflationAdjuster().then((adjuster) => {
      return res.map((item) => {
        item.value = adjuster(item.fiscal_year, item.value);
        return item;
      });
    });
  }
}
