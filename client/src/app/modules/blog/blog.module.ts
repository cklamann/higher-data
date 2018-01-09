import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditPageComponent } from './edit-page/edit-page.component';
import { EditorComponent } from './edit-page/editor/editor.component';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { BlogPageComponent } from './blog-page/blog-page.component';
import { AppRoutingModule } from '../app-routing/app-routing.module';

@NgModule({
	imports: [
		CommonModule,
		FroalaEditorModule.forRoot(),
		FroalaViewModule.forRoot(),
		AppRoutingModule
	],
	 declarations: [EditPageComponent, EditorComponent, BlogPageComponent]
})

export class BlogModule { }
