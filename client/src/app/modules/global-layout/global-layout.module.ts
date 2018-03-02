import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { NavComponent } from './nav/nav.component';
import { AppRoutingModule } from '../app-routing/app-routing.module';
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
	imports: [
		CommonModule, AppRoutingModule, FlexLayoutModule, MatToolbarModule, MatMenuModule, MatButtonModule
	],
	declarations: [HeaderComponent, NavComponent, FooterComponent],
	exports: [
		HeaderComponent, FooterComponent
	]
})
export class GlobalLayoutModule { }
