import { Component, OnInit } from '@angular/core';
import { SiteContentComponent } from '../shared/site-content/site-content.component';
import { Router } from '@angular/router';

@Component({
	selector: 'app-about-page',
	templateUrl: './about-page.component.html',
	styleUrls: ['./about-page.component.scss']
})
export class AboutPageComponent implements OnInit {

	constructor(private router: Router) { }

	ngOnInit() {

	}

	goto(place:string) {
		this.router.navigate([`data/${place}`]);
	}

}
