import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { RouterLinkActive } from '@angular/router';

@Component({
	selector: 'app-admin-page',
	templateUrl: './admin-page.component.html',
	styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit {

	constructor(private auth: AuthService) { }

	ngOnInit() {
		this.auth.authorize();
	}
}
