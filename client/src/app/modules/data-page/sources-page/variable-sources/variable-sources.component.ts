import { Component, OnInit } from '@angular/core';
import { SourceDisplayComponent } from '../source-display/source-display.component';
import { VariableSelectComponent } from '../../../shared/variable-select/variable-select.component';
import { intVariableDefinitionModel } from '../../../../../../server/src/schemas/VariableDefinitionSchema';


@Component({
	selector: 'app-variable-sources',
	templateUrl: './variable-sources.component.html',
	styleUrls: ['./variable-sources.component.scss']
})
export class VariableSourcesComponent implements OnInit {

	variable: intVariableDefinitionModel = null;

	constructor() { }

	ngOnInit() {
	}

	setVariable($event) {
		this.variable = $event;
	}

}
