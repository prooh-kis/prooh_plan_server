import express from "express";
import {
  getAllScreens,
  getScreen,
  getScreenAudienceData,
} from "../controllers/screenController.js";
import { isAuth, isMaster } from "../helpers/authHelpers.js";

const screenRouter = express.Router();

//get router

screenRouter.get("/getScreen", getScreen);
screenRouter.get("/getAllScreens", getAllScreens);
screenRouter.post("/audienceData", getScreenAudienceData);



export default screenRouter;
