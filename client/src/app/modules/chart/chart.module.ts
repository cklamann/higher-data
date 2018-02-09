import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrendChartComponent } from './components/trend-chart/trend-chart.component';

@NgModule({
	imports: [
		CommonModule,
	],
	declarations: [TrendChartComponent],
	exports: [TrendChartComponent]
})
export class ChartModule { }
