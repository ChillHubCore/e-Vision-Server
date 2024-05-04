import express from "express";
import expressAsyncHandler from "express-async-handler";

import { isAdmin, isAuth, isTeamMember } from "../utils.js";
import dotenv from "dotenv";

import Resume from "../models/resumeModel.js";

dotenv.config();

const resumeRouter = express.Router();

resumeRouter.post(
  "/mine/resume",
  isAuth,
  isTeamMember,
  expressAsyncHandler(async (req, res) => {
    const {
      title,
      description,
      experience,
      education,
      skills,
      languages,
      certifications,
      workSamples,
      active,
    } = req.body;

    const resume = new Resume({
      user: req.user._id,
      title,
      description,
      experience,
      education,
      skills,
      languages,
      certifications,
      workSamples,
      active,
    });

    try {
      const createdResume = await resume.save();
      res.status(201).json(createdResume);
    } catch (err) {
      res.status(500).send({ error: err });
    }
  }),
);

resumeRouter.get(
  "/mine/resume",
  isAuth,
  isTeamMember,
  expressAsyncHandler(async (req, res) => {
    try {
      const resume = await Resume.findOne({ user: req.user._id });
      res.status(200).json(resume);
    } catch (err) {
      res.status(500).send({ error: err });
    }
  }),
);

resumeRouter.put(
  "/mine/resume",
  isAuth,
  isTeamMember,
  expressAsyncHandler(async (req, res) => {
    try {
      const resume = await Resume.findOne({ user: req.user._id });

      if (resume) {
        resume.title = req.body.title || resume.title;
        resume.description = req.body.description || resume.description;
        resume.experience = req.body.experience || resume.experience;
        resume.education = req.body.education || resume.education;
        resume.skills = req.body.skills || resume.skills;
        resume.languages = req.body.languages || resume.languages;
        resume.certifications =
          req.body.certifications || resume.certifications;
        resume.workSamples = req.body.workSamples || resume.workSamples;
        resume.active = req.body.active || resume.active;

        const updatedResume = await resume.save();
        res.status(200).send(updatedResume);
      } else {
        res.status(404).send({ message: "Resume Not Found" });
      }
    } catch (err) {
      res.status(500).send({ error: err });
    }
  }),
);

export default resumeRouter;
