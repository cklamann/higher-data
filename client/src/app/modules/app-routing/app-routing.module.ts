import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChartPageComponent } from '../chart-page/chart-page.component';
import { AdminPageComponent } from '../admin/admin-page/admin-page.component';
import { LoginPageComponent } from '../admin/login-page/login-page.component';
import { BlogPageComponent } from '../blog/blog-page/blog-page.component';
import { EditPageComponent } from '../blog/edit-page/edit-page.component';
import { ChartCreatorComponent } from '../admin/admin-page//chart-creator/chart-creator.component';
import { VariableDefinerComponent } from '../admin/admin-page/variable-definer/variable-definer.component'
import { DocsPageComponent } from '../docs-page/docs-page/docs-page.component';
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
			{ path: 'manage-charts', component: ChartCreatorComponent },
			{ path: 'manage-variables', component: VariableDefinerComponent }
		]
	},
	{
		path: 'blog',
		component: BlogPageComponent,
	},
	{
		path: 'docs',
		component: DocsPageComponent,
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