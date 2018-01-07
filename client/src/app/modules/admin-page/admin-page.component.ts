import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';

@Component({
	selector: 'app-admin-page',
	templateUrl: './admin-page.component.html',
	styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit {
	loginForm: FormGroup;
	private _invalidPassword: string = '';

	constructor(private fb: FormBuilder, private auth: AuthService) {
		this.createForm();
	}

	createForm() {
		this.loginForm = this.fb.group({
			username: ['', [Validators.minLength(3), Validators.required]],
			password: ['', [Validators.minLength(3), Validators.required]]
		});
	}

	onSubmit() {
		this.auth.login(this.loginForm.value.username, this.loginForm.value.password)
			.subscribe(
			res => {
				//redirect to real admin page
			},
			err => {
				if (err) {
					console.log(err);
					this._invalidPassword = "Username or password invalid";
				}
			});
	}

	invalidPassword() {
		return this._invalidPassword;
	}

	ngOnInit() {

	}

}
