import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormArray } from "@angular/forms";
import { VariableDefinitions } from "../../../../models/VariableDefinitions";
import { Charts } from "../../../../models/Charts";
import { Categories } from "../../../../models/Categories";
import { SchoolModel } from "./../../../../../../../server/src/schemas/SchoolSchema";
import { ChartExport } from "../../../../../../../server/src/modules/ChartExporter.module";
import { UtilService } from "../../../../services/util/util";
import { clone } from "lodash";

@Component({
  selector: "app-variable-definer",
  templateUrl: "./variable-definer.component.html",
  styleUrls: ["./variable-definer.component.scss"],
})
export class VariableDefinerComponent implements OnInit {
  variableDefinitionForm: FormGroup;
  school: SchoolModel;
  chartData: ChartExport;
  chartOverrides: object = {
    widthRatio: 0.75,
  };
  valueTypes: string[] = this._getValueTypes();
  categories: string[];
  clonePanelOpen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private variableDefinitions: VariableDefinitions,
    private util: UtilService,
    private cats: Categories,
    private Charts: Charts
  ) {
    this.cats
      .fetch("variable")
      .subscribe((res) => (this.categories = res.categories));
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.variableDefinitionForm = this.fb.group({
      _id: "",
      variable: ["", [Validators.minLength(3), Validators.required]],
      valueType: ["", [Validators.minLength(3), Validators.required]],
      friendlyName: ["", [Validators.minLength(3), Validators.required]],
      category: ["", [Validators.minLength(3), Validators.required]],
      sources: this.fb.array([this.initSource()]),
    });
  }

  getClonePanelOpen = () => this.clonePanelOpen;

  initSource(variable: any = null) {
    return this.fb.group({
      startYear: ["", [Validators.minLength(3), Validators.required]],
      endYear: ["", [Validators.minLength(3), Validators.required]],
      source: ["", [Validators.minLength(3), Validators.required]],
      table: ["", [Validators.minLength(3), Validators.required]],
      formula: ["", [Validators.minLength(3), Validators.required]],
      definition: ["", [Validators.minLength(3), Validators.required]],
      notes: ["", [Validators.minLength(3), Validators.required]],
    });
  }

  addSource() {
    const control = <FormArray>this.variableDefinitionForm.controls["sources"];
    control.push(this.initSource());
  }

  cloneVariable = () => (this.clonePanelOpen = true);

  removeVariable(i: number) {
    const control = <FormArray>this.variableDefinitionForm.controls["sources"];
    control.removeAt(i);
  }

  onSubmit() {
    this.variableDefinitions
      .save(this.variableDefinitionForm.value)
      .subscribe((res) => {
        this.variableDefinitionForm.patchValue({
          _id: res._id,
        });
      });
  }

  onVariableSelect(variable: string) {
    this.variableDefinitionForm.patchValue({
      variable: variable,
      _id: "",
      valueType: "",
      friendlyName: "",
      category: "",
    });

    this._resetSources();

    return this.variableDefinitions
      .fetchByName(variable)
      .subscribe((varDef) => {
        if (varDef.length > 0) {
          varDef[0].sources.forEach((variable) => this.addSource());
          this.variableDefinitionForm.setValue(varDef[0]);
        }
        this._loadChart();
      });
  }

  private _resetSources = () => {
    const control = <FormArray>this.variableDefinitionForm.controls["sources"],
      limit = clone(control.length);
    while (control.length) {
      control.removeAt(0);
    }
  };

  onCloneVariableSelect = (variable: string) => {
    this._resetSources();
    return this.variableDefinitions
      .fetchByName(variable)
      .subscribe((varDef) => {
        if (varDef.length > 0) {
          varDef[0].sources.forEach((variable) => this.addSource());
          varDef[0]._id = this.variableDefinitionForm.value._id;
          varDef[0].variable = this.variableDefinitionForm.value.variable;
          this.variableDefinitionForm.setValue(Object.assign(varDef[0]));
        }
      });
  };

  onSchoolSelect(school: SchoolModel) {
    this.school = school;
    this._loadChart();
  }

  private _loadChart() {
    if (!this.variableDefinitionForm.value.variable) return;
    const slug = this.school ? this.school.slug : "northwestern-university";
    this.Charts.fetchChartByVariable(
      this.variableDefinitionForm.value.variable,
      slug
    ).subscribe((res) => {
      this.chartData = res;
    });
  }

  private _getValueTypes() {
    const formatters = this.util
      .numberFormatter()
      .getFormats()
      .map((formatter) => formatter.name) as { [key: string]: string };
    return Object.values(formatters);
  }
}
