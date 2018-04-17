import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { SiteContent } from '../../../../models/SiteContent';
import { intSiteContentSchema } from '../../../../../../server/src/schemas/SiteContentSchema';
import { MatButton } from '@angular/material';
import * as _ from 'lodash';

@Component({
	selector: 'app-content-manager',
	templateUrl: './content-manager.component.html',
	styleUrls: ['./content-manager.component.scss']
})
export class ContentManagerComponent implements OnInit {

	editorContent: string = '<strong>this is some sample html in strong tags</strong>';
	contentList: intSiteContentSchema[];
	contentForm: FormGroup;
	private _contentSelected: boolean = false;


	constructor(private fb: FormBuilder, private SiteContent: SiteContent) { }

	ngOnInit() {
		this._initializeForm();
		this.SiteContent.fetchAll()
			.subscribe(res => this.contentList = res);
	}

	private _initializeForm() {
		this.contentForm = this.fb.group({
			_id: '',
			handle: ['', [Validators.minLength(3), Validators.required]],
			content: [this.editorContent, [Validators.minLength(3), Validators.required]],
			updated: [new Date(), [Validators.minLength(3), Validators.required]],
			created: [new Date(), [Validators.minLength(3), Validators.required]]
		});
	}

	createNewContent() {
		this.contentForm.patchValue({
			content: '',
			_id: '',
			handle: ''
		});
		this.setContentSelected();
	}

	getContentSelected() {
		return this._contentSelected;
	}

	setContentSelected() {
		this._contentSelected = true;
	}

	setContentToEdit(id:string){
		this.contentForm.setValue(this.contentList.find( content => content._id == id));
		this.setContentSelected();
	}

	submitForm() {
		if (this.contentForm.valid) {
			this.contentForm.patchValue({ updated: new Date() });
			this.SiteContent.create(this.contentForm.value)
				.subscribe(res => this.contentForm.setValue(res));
		}
	}



}