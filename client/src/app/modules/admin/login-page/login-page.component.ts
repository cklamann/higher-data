import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-login-page',
	templateUrl: './login-page.component.html',
	styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
	loginForm: FormGroup;
	private _invalidPassword: string = '';

	constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
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
				this.router.navigate(['admin']);
			},
			err => {
				if (err) {
					console.log("errrrrorrororo");
					console.log(err);
					this._invalidPassword = "Username or password invalid";
				}
			});
	}

	invalidPassword() {
		return this._invalidPassword;
	}

}
