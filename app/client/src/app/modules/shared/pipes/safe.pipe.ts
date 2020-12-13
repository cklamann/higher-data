import {Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';

@Pipe({
	name: 'safe'
})
export class SafePipe implements PipeTransform {

	constructor(protected sanitizer: DomSanitizer) {}

	public transform(value: string): SafeStyle {
		return this.sanitizer.bypassSecurityTrustHtml(value);
	}

}