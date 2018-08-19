import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { AboutPageComponent } from './about-page.component';
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatJumbotronModule } from '@angular-material-extensions/jumbotron';
import { MatIconModule } from '@angular/material';

@NgModule({
	imports: [
		CommonModule, SharedModule, FlexLayoutModule, MatJumbotronModule.forRoot(), MatIconModule
	],
	declarations: [AboutPageComponent]
})
export class AboutPageModule { }
