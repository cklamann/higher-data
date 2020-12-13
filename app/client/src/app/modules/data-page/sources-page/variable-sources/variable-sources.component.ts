import { Component, OnInit } from "@angular/core";
import { VariableDefinitionModel } from "./../../../../../../../server/src/schemas/VariableDefinitionSchema";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-variable-sources",
  templateUrl: "./variable-sources.component.html",
  styleUrls: ["./variable-sources.component.scss"],
})
export class VariableSourcesComponent implements OnInit {
  urlVariable: string = "";
  variable: VariableDefinitionModel = null;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    //intialize via url
    this.route.params.subscribe((params) => {
      if (params.variable && !this.variable) {
        this._updateChildSelectControl(params.variable);
      }
    });
  }

  //update via dropxown
  setVariable($event) {
    this.variable = $event;
    this.router.navigate([`data/sources/variables/${this.variable.variable}`]);
  }

  private _updateChildSelectControl(variable: string) {
    this.urlVariable = variable;
  }
}
