import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-admin-page',
	templateUrl: './admin-page.component.html',
	styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit {

	constructor(private auth: AuthService, private router: Router) { }

	ngOnInit() {
		this.auth.authorize().then(res => {
			if(!res) this.router.navigate(['/']);
		});
	}
}
