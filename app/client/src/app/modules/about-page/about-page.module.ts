import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { AboutPageComponent } from './about-page.component';
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatIconModule } from '@angular/material';
import { ChartModule } from '../chart/chart.module';

@NgModule({
	imports: [
		CommonModule, SharedModule, FlexLayoutModule, 
		ChartModule, MatIconModule
	],
	declarations: [AboutPageComponent]
})
export class AboutPageModule { }
