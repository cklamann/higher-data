import { Component, OnInit } from '@angular/core';
import { Schools, School } from '../../models/Schools';
import { HeaderComponent } from '../global-layout/header/header.component';
import { Router } from '@angular/router';


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

	constructor(private router: Router) { }

	ngOnInit(): void {
		let cookies = document.cookie.split(';');
		const redir = cookies.filter(c => c.match(/^redirect=.+/))[0];
		document.cookie = "redirect" + '=; Max-Age=-99999999;';
		if (redir) {
			this.router.navigate([decodeURIComponent(redir.slice(9))]);
		}
	}

}
