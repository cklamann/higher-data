import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RestService } from '../../services/rest/rest.service';
import { AppComponent } from './tests/app.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
	//imports are modules, so you can selectively use the angular modules...
	imports: [BrowserModule,HttpClientModule],
	declarations: [AppComponent], //list all components in the module
	bootstrap: [AppComponent], // which component to start with
	providers: [RestService] //module-wide providers
})

export class AppModule { }