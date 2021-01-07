import { map, mergeMap } from "rxjs/operators";
import { Component, OnInit } from "@angular/core";
import { Schools } from "../../../models/Schools";
import { SchoolModel } from "./../../../../../../server/src/schemas/SchoolSchema";
import { ChartModel } from "./../../../../../../server/src/schemas/ChartSchema";
import { Charts } from "../../../models/Charts";
import {
  ChartExport,
  ChartExportOptions,
} from "../../../../../../server/src/modules/ChartExporter";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import * as _ from "lodash";

@Component({
  selector: "chart-page",
  templateUrl: "./chart-page.component.html",
  styleUrls: ["./chart-page.component.scss"],
})
export class ChartPageComponent implements OnInit {
  chartData: ChartExport;
  chartOptionsForm: FormGroup;
  chartOptionsVisible: boolean = false;
  selections: {
    chartSlug: string;
    schoolSlug: string;
  } = { chartSlug: "", schoolSlug: "" };
  private _chartEmpty: boolean = false;
  private _cut: string = "";
  private _inflationAdjusted: boolean = false;

  constructor(
    public Schools: Schools,
    private Charts: Charts,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.createForm();
    let params = this.route.params;
    let queryVars = this.route.queryParams;
    params
      .pipe(
        mergeMap((param) => {
          return queryVars.pipe(
            map((qv) => {
              return Object.assign({}, qv, param);
            })
          );
        })
      )
      .subscribe((params) => {
        if (params.chart && params.schoolSlug) {
          const options = _.pickBy(
            params,
            (v, k) => k != "chart" && k != "school"
          );
          this.Charts.fetchChart(
            params.schoolSlug,
            params.chart,
            options
          ).subscribe((data) => (this.chartData = data));
          this._setUi(params.schoolSlug, params.chart);
          this._setOptions(options);
        }
      });
  }

  createForm() {
    this.chartOptionsForm = this.fb.group({
      cut: "",
      inflationAdjusted: "",
    });

    this.chartOptionsForm
      .get("inflationAdjusted")
      .valueChanges.subscribe((change) => {
        this._inflationAdjusted = change;
      });

    this.chartOptionsForm.get("cut").valueChanges.subscribe((change) => {
      this._cut = change;
    });
  }

  getChartEmpty() {
    return this._chartEmpty;
  }

  getChartIsCurrency() {
    return (
      this.chartData &&
      this.chartData.chart &&
      !!this.chartData.chart.valueType.match(/currency.+/)
    );
  }

  getChartTitle() {
    if (this.chartData && this.chartData.school) {
      let cutName = this._cut
        ? "Per " +
          this.chartData.chart.cuts.find((item) => item.formula == this._cut)
            .name
        : "";
      return this.chartData
        ? `${this.chartData.school.name} (${this.chartData.school.state}) ${this.chartData.chart.name} ${cutName}`
        : "";
    }
  }

  getIsInflationAdjusted() {
    return !!this._inflationAdjusted;
  }

  getDefaultModel() {
    return this.chartData ? this.chartData.school : null;
  }

  getDefaultChart() {
    return this.selections.chartSlug ? this.selections.chartSlug : null;
  }

  onSchoolSelect(school: SchoolModel | null) {
    if (school) {
      this.selections.schoolSlug = school.slug;
      this.chartOptionsForm.reset();
      this._loadChart();
    }
  }

  onChartSelect(chart: ChartModel) {
    if (chart) {
      this.selections.chartSlug = chart.slug;
      this.chartOptionsForm.reset();
      this._loadChart();
    }
  }

  onCutByChange($event) {
    this._loadChart();
  }

  onInflationChange($event) {
    this._loadChart();
  }

  setChartEmpty($event) {
    setTimeout(() => {
      this._chartEmpty = $event;
    });
  }

  toggleChartOptionsVisible(): void {
    this.chartOptionsVisible = !this.chartOptionsVisible;
  }

  getChartOptionsVisible(): boolean {
    return this.chartOptionsVisible;
  }

  private _setUi(schoolSlug: string, chartSlug: string) {
    this.selections.chartSlug = chartSlug;
    this.selections.schoolSlug = schoolSlug;
  }

  private _setOptions(options: ChartExportOptions) {
    options = Object.assign({ inflationAdjusted: null, cut: null }, options);
    this.chartOptionsForm.patchValue({
      cut: options.cut,
      inflationAdjusted: !!options.inflationAdjusted,
    });
  }

  private _loadChart(): void {
    if (this.selections.schoolSlug && this.selections.chartSlug) {
      const options = _.pickBy(
        this.chartOptionsForm.value,
        (v, k) => !_.isNil(v) && v != ""
      );
      this.router.navigate([
        `data/charts/${this.selections.schoolSlug}/${this.selections.chartSlug}`,
        options,
      ]);
    }
  }
}
