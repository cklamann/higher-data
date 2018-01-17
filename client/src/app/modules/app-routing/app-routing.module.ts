import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChartPageComponent } from '../chart-page/chart-page.component';
import { AdminPageComponent } from '../admin-page/admin-page/admin-page.component';
import { LoginPageComponent } from '../admin-page/login-page/login-page.component';
import { BlogPageComponent } from '../blog/blog-page/blog-page.component';
import { EditPageComponent } from '../blog/edit-page/edit-page.component';
import { ChartCreatorComponent } from '../admin-page/admin-page/chart-creator/chart-creator.component';
//see: https://blog.angular-university.io/angular2-router/
//todo: build 404 page

const routes: Routes = [
	{
		path: '',
		component: ChartPageComponent,
	},
	{
		path: 'login',
		component: LoginPageComponent,
	}, {
		path: 'admin',
		component: AdminPageComponent,
		children: [
			{ path: 'edit-blog', component: EditPageComponent },
			{ path: 'create-chart', component: ChartCreatorComponent }
		]
	},
	{
		path: 'blog',
		component: BlogPageComponent,
	},
	{
		path: '**',
		redirectTo: '/',
		pathMatch: 'full'
	}

];

@NgModule({
	imports: [
		RouterModule.forRoot(routes)
	],
	exports: [
		RouterModule
	],
	declarations: []
})
export class AppRoutingModule { }