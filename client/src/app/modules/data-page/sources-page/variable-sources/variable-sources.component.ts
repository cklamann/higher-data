import { Component, OnInit } from '@angular/core';
import { SourceDisplayComponent } from '../source-display/source-display.component';
import { VariableSelectComponent } from '../../../shared/variable-select/variable-select.component';
import { intVariableDefinitionModel } from '../../../../../../server/src/schemas/VariableDefinitionSchema';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-variable-sources',
	templateUrl: './variable-sources.component.html',
	styleUrls: ['./variable-sources.component.scss']
})
export class VariableSourcesComponent implements OnInit {

	urlVariable: string = "";
	variable: intVariableDefinitionModel = null;

	constructor(private router: Router, private route: ActivatedRoute) { }

	ngOnInit() {
		//update via url
		this.route.params.subscribe(params => {
			if (params && params.variable && (!this.variable || this.variable.variable != params.variable)) {
				this._updateChildSelectControl(params.variable);
			}
		});
	}

	//update via dropxown
	setVariable($event) {
		const variable = this.variable ? this.variable : null;
		if ($event && $event != variable) {
			this.variable = $event;
			this.router.navigate([`data/sources/variables/${this.variable.variable}`]);
		}
	}

	private _updateChildSelectControl(variable: string) {
		this.urlVariable = variable;
	}

}