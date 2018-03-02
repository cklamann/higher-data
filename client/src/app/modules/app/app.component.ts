import { Component, OnInit } from '@angular/core';
import { Schools, School } from '../../models/Schools';
import { HeaderComponent } from '../global-layout/header/header.component';
import { FooterComponent } from '../global-layout/footer/footer.component';
import { Router } from '@angular/router';
import * as _ from 'lodash';


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

	constructor(private router: Router) { }

	ngOnInit(): void { }

}
