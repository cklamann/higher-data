import { Component, OnInit, Input } from '@angular/core';
import { SiteContent } from '../../../models/SiteContent';

@Component({
	selector: 'app-site-content',
	templateUrl: './site-content.component.html',
	styleUrls: ['./site-content.component.scss']
})

export class SiteContentComponent implements OnInit {

	@Input() handle: string;
	content: string = '';

	constructor(private SiteContent: SiteContent) {

	}

	ngOnInit() {
		this.SiteContent.fetchByHandle(this.handle)
			.subscribe( res => this.content = res.content);
	}
}
