import express from "express";
import * as tracker from "../controllers/tracker.controller.js"

export default () => {

  var router = express.Router();

  router.post("/track", tracker.append);

  return router;
};
