import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { NavComponent } from './nav/nav.component';
import { AppRoutingModule } from '../app-routing/app-routing.module';
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button'


//note use of exports here -- the other modules don't export, they don't consume, this
//is a global module that other modules will use, so we need to declare what exports
//they will be able to consume

@NgModule({
  imports: [
	  CommonModule, AppRoutingModule, FlexLayoutModule,MatToolbarModule,MatMenuModule, MatButtonModule
  ],
  declarations: [HeaderComponent, NavComponent],
  exports: [
  	HeaderComponent
  ]
})
export class GlobalLayoutModule { }
