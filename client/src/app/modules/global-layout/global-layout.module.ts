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
import { MatIconModule } from '@angular/material/icon';
import { OverlayContainer } from '@angular/cdk/overlay';

@NgModule({
	imports: [
		CommonModule, AppRoutingModule, FlexLayoutModule, 
		MatToolbarModule, MatMenuModule, MatButtonModule,
		MatIconModule
	],
	declarations: [HeaderComponent, NavComponent, FooterComponent],
	exports: [
		HeaderComponent, FooterComponent
	]
})
export class GlobalLayoutModule {
  constructor(overlayContainer: OverlayContainer) {
    overlayContainer.getContainerElement().classList.add('higher-app-theme');
  }
}