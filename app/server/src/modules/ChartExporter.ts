import * as _ from "lodash";
import { SchoolModel } from "../schemas/SchoolSchema";
import { ChartModel, ChartVariableModel } from "../schemas/ChartSchema";
import { FormulaParser, FormulaParserResult } from "../modules/FormulaParser";
import { getInflationAdjuster } from "../modules/InflationAdjuster";
import { SchoolDataQuery } from "./SchoolDataQuery";
import { SchoolDataSchema } from "../schemas/SchoolDataSchema";

export interface ChartExport {
  chart: ChartModel;
  school: SchoolModel;
  data: ChartExportDataParentModel[];
  options: ChartExportOptions;
}

export interface ChartExportDataParentModel {
  legendName: string;
  data: FormulaParserResult[];
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

  //todo: separate fetch and processing functions so we can test the latter

  public export(): Promise<ChartExport> {
    const promises = this.chart.variables.map(
      (variable: ChartVariableModel) => {
        const parser = new FormulaParser(variable.formula),
          variables = parser.getVariables(),
          query = new SchoolDataQuery({});
        query.addFilter("unitid", {
          value: this.school.unitid,
          comparator: "eq",
        });
        query.addFilter("variable", {
          value: variables,
          comparator: "in",
        });
        return {
          data: SchoolDataSchema.schema.statics.fetch(query),
          formula: variable.formula,
        };
      }
    );
    return Promise.all(promises)
      .then((values) => {
        const evaluated = values.map((val) => {
          const parser = new FormulaParser(val.formula);
          return parser.evaluate(val.data);
        });

        if (this.options.inflationAdjusted == "true") {
          let promises = evaluated.map((data) =>
            this._adjustForInflation(data)
          );
          return Promise.all(promises);
        } else return evaluated;
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
    res: FormulaParserResult[]
  ): Promise<FormulaParserResult[]> {
    return getInflationAdjuster().then((adjuster) => {
      return res.map((item) => {
        item.value = adjuster(item.fiscal_year, item.value);
        return item;
      });
    });
  }
}
