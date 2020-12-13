import { Router } from "express";
import { CategorySchema } from "../schemas/CategorySchema";

const router = Router();

router.get("/:type", function (req, res, next): Promise<void> {
  return CategorySchema.findOne({ type: req.params.type })
    .select("-__v")
    .then((cats) => {
      res.json(cats);
      return;
    })
    .catch((err) => next(err));
});

module.exports = router;
