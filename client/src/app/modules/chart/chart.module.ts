import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BaseChart} from './models/BaseChart';
import { LineChart } from './models/LineChart';
import { LineChartComponent } from './components/line-chart/line-chart.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [LineChartComponent]
})
export class ChartModule { }
