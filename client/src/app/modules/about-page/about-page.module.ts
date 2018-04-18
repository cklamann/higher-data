import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { AboutPageComponent } from './about-page.component';

@NgModule({
	imports: [
		CommonModule, SharedModule
	],
	declarations: [AboutPageComponent]
})
export class AboutPageModule { }
