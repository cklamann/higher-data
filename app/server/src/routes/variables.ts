import { SchoolSchema } from "../schemas/SchoolSchema";
import { SchoolDataSchema } from "../schemas/SchoolDataSchema";
import { VariableDefinitionSchema } from "../schemas/VariableDefinitionSchema";
import { Router } from "express";
import { ChartExporter } from "../modules/ChartExporter";
import * as passport from "passport";
import { ChartModel } from "../schemas/ChartSchema";

const router = Router();

router.get(
  "/fetch_names",
  passport.authenticate("basic", { session: false }),
  function (req, res, next) {
    SchoolDataSchema.schema.statics
      .getVariableList()
      .then((resp: string[]) => {
        return res.json(resp);
      })
      .catch((err: Error) => next(err));
  }
);

router.get("/fetch_by_name", function (req, res, next) {
  const names = (req.query.name as string).split(",");
  VariableDefinitionSchema.find({ variable: { $in: names } })
    .select("-__v")
    .then((resp) => {
      res.json(resp);
      return;
    })
    .catch((err) => next(err));
});

router.get("/", function (req, res, next) {
  let filter = req.query.defined ? { "sources.0": { $exists: true } } : {};
  VariableDefinitionSchema.find({ "sources.0": { $exists: true } })
    .then((resp) => {
      return res.json(resp);
    })
    .catch((err) => next(err));
});

router.get(
  "/:variable/chart/:school",
  passport.authenticate("basic", { session: false }),
  function (req, res, next) {
    let chartModel: ChartModel = {
      name: "preview",
      slug: "preview",
      type: "line",
      category: "test",
      active: true,
      valueType: "decimal2",
      description: "test",
      variables: [
        {
          formula: req.params.variable,
          notes: "test",
          legendName: req.params.variable,
        },
      ],
      cuts: [],
    };

    SchoolSchema.schema.statics
      .fetch(req.params.school)
      .then((school: SchoolSchema) => {
        const chart = new ChartExporter(school, chartModel, { cut: "" });
        chart
          .export()
          .then((chart) => {
            res.json(chart);
            return;
          })
          .catch((err) => next(err));
      });
  }
);

router.post("/", passport.authenticate("basic", { session: false }), function (
  req,
  res,
  next
) {
  let promise: Promise<any>;
  //todo: put this logic in app-wide transformer
  if (req.body._id.length > 1) {
    promise = VariableDefinitionSchema.schema.statics.fetchAndUpdate(req.body);
  } else {
    delete req.body._id;
    promise = VariableDefinitionSchema.create(req.body);
  }

  promise
    .then((chart: VariableDefinitionSchema) => {
      res.json(chart);
      return;
    })
    .catch((err: Error) => next(err));
});

module.exports = router;
