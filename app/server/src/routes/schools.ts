import { SchoolSchema } from "../schemas/SchoolSchema";
import { Router } from "express";
import { ChartExporter } from "../modules/ChartExporter";
import { ChartSchema } from "../schemas/ChartSchema";
import * as Q from "q";
import * as _ from "lodash";
const router = Router(),
  School = SchoolSchema;

router.get("/", function (req, res, next) {
  School.schema.statics
    .search(req.query.q)
    .then((resp: SchoolSchema[]) => {
      res.json(resp);
      return;
    })
    .catch((err: Error) => next(err));
});

router.get("/:id", function (req, res, next) {
  School.findOne({ unitid: req.params.id })
    .then((school) => {
      console.log(school);
      res.json(school);
      return;
    })
    .catch((err) => next(err));
});

router.get("/:schoolSlug/charts/:chartSlug", function (req, res, next) {
  const promises: Promise<any>[] = [],
    options = req.query ? req.query : {};
  promises.push(SchoolSchema.schema.statics.fetch(req.params.schoolSlug));
  promises.push(ChartSchema.findOne({ slug: req.params.chartSlug }).exec());
  Q.all(promises).then((fulfs) => {
    const chart = new ChartExporter(fulfs[0], fulfs[1], options);
    chart
      .export()
      .then((chart) => {
        res.json(chart);
        return;
      })
      .catch((err) => next(err));
  });
});

module.exports = router;
