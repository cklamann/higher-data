import { Injectable } from "@angular/core";
import {
  ChartModel,
  ChartSchema,
  CutByModel,
  ChartVariableModel,
} from "../../../../server/src/schemas/ChartSchema";
import { RestService } from "../services/rest/rest.service";
import { Observable } from "rxjs";
import {
  ChartExport,
  ChartExportOptions,
} from "../../../../server/src/modules/ChartExporter.module";
import { LineChart } from "../modules/chart/models/LineChart";
import { AreaChart } from "../modules/chart/models/AreaChart";
import { SteamChart } from "../modules/chart/models/SteamChart";
import { BubbleStackChart } from "../modules/chart/models/BubbleStackChart";
import { SchoolModel } from "../../../../server/src/schemas/SchoolSchema";
import * as _ from "lodash";

@Injectable()
export class Charts {
  constructor(private rest: RestService) {}

  fetch(id: number): Observable<ChartSchema> {
    return this.rest.get(`api/charts/${id}`);
  }

  fetchAll(): Observable<ChartModel[]> {
    return this.rest.get(`charts`);
  }

  save(model: ChartModel): Observable<ChartSchema> {
    return this.rest.post(`charts`, model);
  }

  delete(_id: string): Observable<any> {
    return this.rest.delete(`charts/${_id}`);
  }

  fetchChart(
    schoolSlug: string,
    chartSlug: string,
    options: ChartExportOptions = {}
  ): Observable<ChartExport> {
    var queryString = "";
    if (!_.isEmpty(options)) {
      queryString =
        "?" +
        Object.entries(options)
          .map((pair) => pair[0] + "=" + pair[1])
          .join("&")
          .replace(/\+/g, "%2B");
    }
    return this.rest.get(
      `schools/${schoolSlug}/charts/${chartSlug}${queryString}`
    );
  }

  fetchChartPreview(schoolModel: SchoolModel, chartModel: ChartModel) {}

  fetchChartByVariable(
    variable: string,
    slug: string
  ): Observable<ChartExport> {
    return this.rest.get(`variables/${variable}/chart/${slug}`);
  }

  resolveChart(chartData: ChartExport, selector: string, overrides: object) {
    switch (chartData.chart.type) {
      case "line":
        return new LineChart(chartData, selector, overrides);
      case "area":
        return new AreaChart(chartData, selector, overrides);
      case "steam":
        return new SteamChart(chartData, selector, overrides);
      case "bubble-stack":
        return new BubbleStackChart(chartData, selector, overrides);
    }
  }
}

export class Chart implements ChartModel {
  name: string;
  slug: string;
  type: string;
  category: string;
  active: boolean;
  valueType: string;
  description: string;
  variables: ChartVariableModel[];
  cuts: CutByModel[];
  constructor(obj: ChartModel) {
    this.name = obj.name;
    this.slug = obj.slug;
    this.type = obj.type;
    this.category = obj.category;
    this.active = obj.active;
    this.valueType = obj.valueType;
    this.description = obj.description;
    this.variables = obj.variables;
    this.cuts = obj.cuts;
  }
}
