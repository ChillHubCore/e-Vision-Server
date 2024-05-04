import mongoose from "mongoose";

const workSampleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 255,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 100000,
    },
    url: {
      type: String,
      required: true,
      maxlength: 255,
    },
    image: {
      type: String,
      required: true,
      maxlength: 255,
    },
    technologies: {
      type: [String],
      required: true,
      maxlength: 255,
    },
  },
  {
    timestamps: true,
  },
);

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 255,
    },
    workExperience: {
      type: [
        {
          company: {
            type: String,
            required: true,
            maxlength: 255,
          },
          position: {
            type: String,
            required: true,
            maxlength: 255,
          },
          startDate: {
            type: Date,
            required: true,
          },
          endDate: {
            type: Date,
            required: true,
          },
          description: {
            type: String,
            required: true,
            maxlength: 100000,
          },
        },
      ],
      required: true,
    },
    education: {
      type: [
        {
          institution: {
            type: String,
            required: true,
            maxlength: 255,
          },
          degree: {
            type: String,
            required: true,
            maxlength: 255,
          },
          startDate: {
            type: Date,
            required: true,
          },
          endDate: {
            type: Date,
            required: true,
          },
          description: {
            type: String,
            required: true,
            maxlength: 100000,
          },
        },
      ],
    },
    skills: {
      type: [
        {
          name: {
            type: String,
            required: true,
            maxlength: 255,
          },
          level: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
            required: true,
            maxlength: 255,
          },
        },
      ],
      required: true,
    },
    certifications: {
      type: [
        {
          name: {
            type: String,
            required: true,
            maxlength: 255,
          },
          institution: {
            type: String,
            required: true,
            maxlength: 255,
          },
        },
      ],
    },
    languages: {
      type: [
        {
          name: {
            type: String,
            required: true,
            maxlength: 255,
          },
          level: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced", "Fluent", "Native"],
            required: true,
            maxlength: 255,
          },
        },
      ],
      required: true,
    },
    hobbies: {
      type: [
        {
          type: String,
          required: true,
          maxlength: 255,
        },
      ],
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    workSamples: [workSampleSchema],
  },
  {
    timestamps: true,
  },
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
