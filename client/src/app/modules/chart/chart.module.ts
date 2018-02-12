import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrendChartComponent } from './components/trend-chart/trend-chart.component';
import { UtilService } from '../../services/util/util';

@NgModule({
	imports: [
		CommonModule,
	],
	declarations: [TrendChartComponent],
	exports: [TrendChartComponent],
	providers: [UtilService]
})
export class ChartModule { }
