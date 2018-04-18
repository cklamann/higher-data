import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChartPageComponent } from '../data-page/chart-page/chart-page.component';
import { DataPageComponent } from '../data-page/data-page.component';
import { TablePageComponent } from '../data-page/table-page/table-page.component'
import { AdminPageComponent } from '../admin/admin-page/admin-page.component';
import { ContentManagerComponent } from '../admin/admin-page/content-manager/content-manager.component';
import { LoginPageComponent } from '../admin/login-page/login-page.component';
import { AboutPageComponent } from '../about-page/about-page.component';
import { BlogPageComponent } from '../blog/blog-page/blog-page.component';
import { EditPageComponent } from '../blog/edit-page/edit-page.component';
import { ChartCreatorComponent } from '../admin/admin-page//chart-creator/chart-creator.component';
import { VariableDefinerComponent } from '../admin/admin-page/variable-definer/variable-definer.component'
import { ChartSourcesComponent } from '../data-page/sources-page/chart-sources/chart-sources.component';
import { VariableSourcesComponent } from '../data-page/sources-page/variable-sources/variable-sources.component';
import { SourcesPageComponent } from '../data-page/sources-page/sources-page.component';
//todo: build 404 page

const routes: Routes = [
	{
		path: 'data',
		component: DataPageComponent,
		children: [
			{ path: '', redirectTo: 'charts', pathMatch: 'full' },
			{ path: 'charts', component: ChartPageComponent },
			{ path: 'charts/:school/:chart', component: ChartPageComponent },
			{ path: 'tables', component: TablePageComponent },
			{
				path: 'sources', component: SourcesPageComponent, children: [
					{ path: '', redirectTo: 'charts', pathMatch: 'full' },
					{ path: 'charts', component: ChartSourcesComponent },
					{ path: 'charts/:chart', component: ChartSourcesComponent },
					{ path: 'variables', component: VariableSourcesComponent },
					{ path: 'variables/:variable', component: VariableSourcesComponent }
				],
			}]
	},
	{
		path: 'login',
		component: LoginPageComponent,
	},
	{
		path: 'about',
		component: AboutPageComponent,
	}, 
	{
		path: 'admin',
		component: AdminPageComponent,
		children: [
			{ path: 'edit-blog', component: EditPageComponent },
			{ path: 'manage-charts', component: ChartCreatorComponent },
			{ path: 'manage-variables', component: VariableDefinerComponent },
			{ path: 'manage-content', component: ContentManagerComponent }
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