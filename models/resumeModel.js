import mongoose from "mongoose";

const workSampleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255,
    },
    description: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100000,
    },
    url: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255,
    },
    image: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255,
    },
    technologies: {
      type: [String],
      required: true,
      minlength: 3,
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
      required: true,
    },
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255,
    },
    workExperience: {
      type: [
        {
          company: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 255,
          },
          position: {
            type: String,
            required: true,
            minlength: 3,
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
            minlength: 3,
            maxlength: 100000,
          },
        },
      ],
      required: true,
    },
    education: {
      type: {
        institution: {
          type: String,
          required: true,
          minlength: 3,
          maxlength: 255,
        },
        degree: {
          type: String,
          required: true,
          minlength: 3,
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
          minlength: 3,
          maxlength: 100000,
        },
      },
      required: true,
    },
    skills: {
      type: [
        {
          name: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 255,
          },
          level: {
            type: String,
            required: true,
            minlength: 3,
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
            minlength: 3,
            maxlength: 255,
          },
          institution: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 255,
          },
        },
      ],
      required: true,
    },
    languages: {
      type: [
        {
          name: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 255,
          },
          level: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 255,
          },
        },
      ],
      required: true,
    },
    hobbies: {
      type: [
        {
          name: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 255,
          },
        },
      ],
      required: true,
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
