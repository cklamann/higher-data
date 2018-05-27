import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { intVariableDefinitionModel } from '../../../../../../server/src/schemas/VariableDefinitionSchema';

@Component({
	selector: 'app-source-display',
	templateUrl: './source-display.component.html',
	styleUrls: ['./source-display.component.scss']
})
export class SourceDisplayComponent implements OnInit {

	@Input()
	variable: intVariableDefinitionModel = null;

	constructor() { }

	ngOnInit() {

	}

	ngOnChanges(changes:SimpleChanges){

	}

}
