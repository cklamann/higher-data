import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { VariableDefinitionModel } from './../../../../../../../server/src/schemas/VariableDefinitionSchema';

@Component({
	selector: 'app-source-display',
	templateUrl: './source-display.component.html',
	styleUrls: ['./source-display.component.scss']
})
export class SourceDisplayComponent implements OnInit {

	@Input()
	variable: VariableDefinitionModel = null;

	constructor() { }

	ngOnInit() {

	}

	ngOnChanges(changes:SimpleChanges){

	}

}
