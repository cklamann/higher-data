import { debounceTime, switchMap, first } from "rxjs/operators";
import {
  Component,
  OnInit,
  QueryList,
  Input,
  Output,
  EventEmitter,
  ViewChildren,
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatOption } from "@angular/material";
import { Charts } from "../../../models/Charts";
import { ChartModel } from "./../../../../../../server/src/schemas/ChartSchema";
import * as _ from "lodash";

interface intChartList {
  category: string;
  charts: ChartModel[];
}
[];

@Component({
  selector: "app-chart-search",
  templateUrl: "./chart-search.component.html",
  styleUrls: ["./chart-search.component.scss"],
})
export class ChartSearchComponent implements OnInit {
  chartSelectForm: FormGroup;

  @Input()
  defaultChart: string;

  @Output()
  onChartSelect: EventEmitter<ChartModel> = new EventEmitter<ChartModel>();

  @ViewChildren(MatOption) options: QueryList<MatOption>;

  charts: intChartList;

  constructor(private fb: FormBuilder, private Charts: Charts) {
    this.createForm();
  }

  ngOnInit() {
    this.Charts.fetchAll()
      .pipe(
        switchMap((res) => {
          this.charts = this._groupCharts(res);
          return this.options.changes;
        }),
        first()
      )
      .subscribe((change) => {
        if (change.length) {
          change.forEach((option) => {
            if (
              option.value &&
              this.defaultChart &&
              option.value.slug == this.defaultChart
            ) {
              //todo: replace with better solution once angular solves it
              setTimeout(() => {
                option["_selectViaInteraction"]();
              });
            }
          });
        }
      });
    this.listenForSearchChanges();
  }

  createForm() {
    this.chartSelectForm = this.fb.group({
      chart: [""],
    });
  }

  listenForSearchChanges(): void {
    this.chartSelectForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe((input) => {
        this.onChartSelect.emit(input.chart);
      });
  }

  //chaining seems to blow up typescript...
  _groupCharts(charts): any {
    return _.chain(charts)
      .sortBy((chart) => chart.name)
      .groupBy((chart) => chart.category)
      .map((v, k) => {
        return {
          category: k,
          charts: v,
        };
      })
      .sortBy((cat) => cat.category)
      .value();
  }
}
