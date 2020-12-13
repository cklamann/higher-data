import { debounceTime, switchMap, first } from "rxjs/operators";
import {
  Component,
  OnInit,
  QueryList,
  Output,
  Input,
  EventEmitter,
  ViewChildren,
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatOption } from "@angular/material";
import { VariableDefinitions } from "../../../models/VariableDefinitions";
import { VariableDefinitionModel } from "./../../../../../../server/src/schemas/VariableDefinitionSchema";

@Component({
  selector: "app-variable-definition-select",
  templateUrl: "./variable-definition-select.component.html",
  styleUrls: ["./variable-definition-select.component.scss"],
})
export class VariableDefinitionSelectComponent implements OnInit {
  VariableDefinitionSelectForm: FormGroup;
  @Output()
  onVariableDefinitionSelect: EventEmitter<
    VariableDefinitionModel
  > = new EventEmitter<VariableDefinitionModel>();
  @Input()
  defined: boolean = false;
  @Input()
  urlVariable: string = "";
  @Input()
  multi: boolean = false;
  @Input()
  selectMax: number;
  @ViewChildren(MatOption) options: QueryList<MatOption>;

  variables: VariableDefinitionModel[] = [];

  constructor(
    private fb: FormBuilder,
    private VariableDefinitions: VariableDefinitions
  ) {}

  ngOnInit() {
    this.createForm();
    this.VariableDefinitions.fetchAll(this.defined)
      .pipe(
        switchMap((res) => {
          this.variables = res;
          return this.options.changes;
        })
      )
      .subscribe((change) => {
        if (change.length) {
          change.forEach((option) => {
            if (
              option.value &&
              this.urlVariable &&
              option.value.variable == this.urlVariable
            ) {
              setTimeout(() => {
                option["_selectViaInteraction"]();
              });
            }
          });
        }
      });
    this.listenForSelectChanges();
  }

  createForm() {
    this.VariableDefinitionSelectForm = this.fb.group({
      variable: [""],
    });
  }

  updateForm(vari: string) {
    if (this.options.length === 0) {
      this.options.changes.pipe(first()).subscribe((change) => {
        change.forEach((option) => {
          if (option.value && option.value.variable == vari) {
            setTimeout(() => {
              option["_selectViaInteraction"]();
            });
          }
        });
      });
    } else {
      this.options.forEach((option) => {
        if (option.value && option.value.variable == vari) {
          setTimeout(() => {
            option["_selectViaInteraction"]();
          });
        }
      });
    }
  }

  listenForSelectChanges(): void {
    this.VariableDefinitionSelectForm.valueChanges.subscribe((change) => {
      if (
        this.multi &&
        this.selectMax &&
        change.variable.length >= this.selectMax
      ) {
        this.options.forEach((option) => {
          if (!option.selected) {
            option.disabled = true;
          }
        });
      } else this.options.forEach((option) => (option.disabled = false));
    });

    this.VariableDefinitionSelectForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe((input) => {
        this.onVariableDefinitionSelect.emit(input.variable);
      });
  }
}
