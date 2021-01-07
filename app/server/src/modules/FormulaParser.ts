import { SchoolBaseDataModel } from "../schemas/SchoolDataSchema";
import { VariableDefinitionSchema } from "../schemas/VariableDefinitionSchema";
import * as M from "mathjs";
import { difference, flatMap, groupBy, map, uniq } from "lodash";

export interface FormulaParserResult {
  fiscal_year: string;
  value: any;
}

export class FormulaParser {
  formula: string;
  cleanFormula: string;
  symbolNodes: string[];
  optionalSymbolNodes: string[];

  constructor(formula: string) {
    this.formula = formula;
    this.cleanFormula = this._stripOptionalMarkers(formula);
    this.symbolNodes = this._getSymbolNodes(this.cleanFormula);
    this.optionalSymbolNodes = this._getSymbolNodes(this.formula)
      .filter((node) => node.match(/^__opt_.+/))
      .map((node) => this._stripOptionalMarkers(node));
  }

  public validate() {
    return this._verifyNodesDefined();
  }

  private _transformModelForFormula(data: SchoolBaseDataModel[]): object[] {
    const grouped = groupBy(data, "fiscal_year");
    return map(grouped, (v, k) => ({
      [k]: v
        .map((item) => ({ [item.variable]: item.value }))
        .reduce((acc, curr) => ({ ...acc, ...curr })),
    })).filter((item) => {
      return (
        difference(
          this.symbolNodes,
          flatMap(Object.values(item), (i) => Object.keys(i))
        ).length === 0
      );
    });
  }

  public getVariables() {
    return this.symbolNodes;
  }

  private _fillMissingOptionalData(
    schoolData: SchoolBaseDataModel[]
  ): SchoolBaseDataModel[] {
    const yearRange = this._getYearRange(schoolData);

    yearRange.forEach((year) => {
      this.optionalSymbolNodes.forEach((optionalNode) => {
        if (
          !schoolData.find(
            (datum) =>
              datum.fiscal_year === year && datum.variable === optionalNode
          )
        ) {
          schoolData.push({
            fiscal_year: year,
            variable: optionalNode,
            value: 0,
          });
        }
      });
    });

    return schoolData;
  }

  private _getYearRange(yearsData: SchoolBaseDataModel[]): string[] {
    return uniq(yearsData.map((datum) => datum.fiscal_year));
  }

  private _getSymbolNodes(formula: string): string[] {
    let nodes: string[] = [],
      parsed: any = M.parse(formula);
    _recurse(parsed);
    function _recurse(parsed: any) {
      if (parsed.content) {
        parsed = parsed.content;
      }
      if (parsed.args) {
        parsed.args.forEach((child: any) => _recurse(child));
      }
      if (parsed.name) {
        nodes.push(parsed.name);
      }
    }
    return nodes;
  }

  public evaluate(data: SchoolBaseDataModel[]) {
    const fullData = this._fillMissingOptionalData(data),
      transformedData = this._transformModelForFormula(fullData);
    console.log(transformedData);
    return this._evaluate(transformedData);
  }

  //verify that there's at least one variable and that a definition exists for every variable passed in
  //this is for on create rather than on build
  private _verifyNodesDefined(): Promise<boolean> {
    return VariableDefinitionSchema.find()
      .exec()
      .then((variables) => {
        const allVars = flatMap(variables, (vari) => vari.variable);
        let valid = true;
        if (this.symbolNodes.length === 0) {
          valid = false;
        }
        this.symbolNodes.forEach((node) => {
          if (!allVars.includes(node)) {
            valid = false;
          }
        });
        return valid;
      });
  }

  //any is the intermediate data model
  private _evaluate(chartData: any[]): FormulaParserResult[] {
    return chartData.map((datum) => {
      return {
        fiscal_year: Object.keys(datum)[0],
        value: M.eval(this.cleanFormula, Object.values(datum)[0]),
      };
    });
  }

  private _stripOptionalMarkers(item: string): string {
    return item.replace(/__opt_/g, "");
  }
}
