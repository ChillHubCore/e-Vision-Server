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
      workExperience,
      active,
      hobbies,
      socials,
    } = req.body.values;

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
      workExperience,
      active,
      hobbies,
      socials,
    });

    try {
      const createdResume = await resume.save();
      res.status(201).json(createdResume);
    } catch (err) {
      console.log(err);
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
        resume.title = req.body.values.title || resume.title;
        resume.description = req.body.values.description || resume.description;
        resume.education = req.body.values.education || resume.education;
        resume.skills = req.body.values.skills || resume.skills;
        resume.languages = req.body.values.languages || resume.languages;
        resume.certifications =
          req.body.values.certifications || resume.certifications;
        resume.workSamples = req.body.values.workSamples || resume.workSamples;
        resume.active = req.body.values.active || resume.active;
        resume.workExperience =
          req.body.values.workExperience || resume.workExperience;
        resume.hobbies = req.body.values.hobbies || resume.hobbies;
        resume.socials = req.body.values.socials || resume.socials;

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
