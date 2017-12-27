import { Component, OnInit } from '@angular/core';
import { Schools, School } from '../../../models/Schools';
import { HeaderComponent } from '../../global-layout/header/header.component';

@Component({ 
	selector: 'app-root', 
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

	constructor( ) { }

	ngOnInit(): void {

	}

}
