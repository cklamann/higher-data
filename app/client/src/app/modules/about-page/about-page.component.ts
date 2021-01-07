import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ChartExport } from "../../../../../server/src/modules/ChartExporter";
import { TrendChartComponent } from "../chart/components/trend-chart/trend-chart.component";
import { RestService } from "../../services/rest/rest.service";
import { states } from "../../services/data/states";
import { sectors } from "../../services/data/sectors";
import { SchoolQueryParams } from "./../../../../../server/src/routes/schoolData";
import { Filter } from "../../../../../server/src/modules/SchoolDataQuery";
import { Subscription } from "rxjs";
import * as _ from "lodash";

@Component({
  selector: "app-about-page",
  templateUrl: "./about-page.component.html",
  styleUrls: ["./about-page.component.scss"],
})
export class AboutPageComponent implements OnInit {
  @ViewChild("bubbleChart") bubbleChart: TrendChartComponent;

  chartData: ChartExport;
  stabbr: string = "PA";
  bubbleSubscription: Subscription;
  private _chartData: any;
  constructor(private router: Router, private rest: RestService) {}

  ngOnInit() {
    let schoolQuery: SchoolQueryParams = {
      filters: _buildFilterString({
        state: { comparator: "eq", value: this.stabbr },
        sector: { comparator: "eq", value: "1" },
        variable: { comparator: "eq", value: "in_state_tuition" },
      }),
      page: "1",
      inflationAdjusted: "true",
      type: "normal",
      perPage: "1",
      sort: "value",
      order: "desc",
    };

    this._chartData = {
      chart: {
        name: "My Little Chart",
        slug: "my-little-chart",
        type: "bubble-stack",
        category: "finance",
        active: true,
        description: "",
        variables: [
          {
            formula: "in_state_tuition",
            notes: "---",
            legendName: "In-State Tuition",
          },
        ],
        cuts: [],
        valueType: "currency0",
      },
      school: {
        unitid: "11111",
        name: "Does this Matter?",
        state: "NO",
        city: "NA",
        ein: "11111",
        sector: "0",
        locale: "1",
        hbcu: "0",
        slug: "fake",
      },
      data: [],
    };

    function _lookupSector(sector) {
      return sectors.find((sect) => sect.number == sector).name;
    }

    //});
  }

  ngOnDestroy() {
    this.bubbleChart.chart.remove();
    delete this.bubbleChart;
    this.bubbleSubscription.unsubscribe();
  }

  goto(place: string) {
    this.router.navigate([`data/${place}`]);
  }

  getStateName() {
    return states.find((item) => item.abbreviation === this.stabbr).name;
  }

  setChartEmpty($event) {
    //return console.log('i\'m setting chart empty');
  }
}

const _buildFilterString = (filters: Record<string, Filter>) =>
  Object.keys(filters).reduce((acc, c) => {
    return `${acc ? acc + "|" : ""}${c}:${filters[c].comparator}:${
      filters[c].value
    }`;
  }, "");
