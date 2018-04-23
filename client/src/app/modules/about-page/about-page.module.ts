import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { AboutPageComponent } from './about-page.component';
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
	imports: [
		CommonModule, SharedModule, FlexLayoutModule
	],
	declarations: [AboutPageComponent]
})
export class AboutPageModule { }
