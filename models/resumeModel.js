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
          _id: false,
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
          _id: false,
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
          _id: false,
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
          _id: false,
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
          _id: false,
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
    socials: [
      {
        username: {
          type: String,
          required: true,
          maxlength: 255,
        },
        url: {
          type: String,
          required: true,
          maxlength: 255,
        },
        platform: {
          type: {
            name: {
              type: String,
              required: true,
              maxlength: 255,
              enum: [
                "Gmail",
                "LinkedIn",
                "GitHub",
                "YouTube",
                "Telegram",
                "Discord",
              ],
            },
            icon: {
              type: String,
              required: true,
              maxlength: 255,
            },
          },
          required: true,
          maxlength: 255,
          enum: [
            {
              name: "Gmail",
              icon: "https://res.cloudinary.com/dn16ti55j/image/upload/v1714924609/icons/gmail_jnqb0o.png",
            },
            {
              name: "LinkedIn",
              icon: "https://res.cloudinary.com/dn16ti55j/image/upload/v1714924612/icons/linkedin_olt9r1.webp",
            },
            {
              name: "GitHub",
              icon: "https://res.cloudinary.com/dn16ti55j/image/upload/v1714924624/icons/github_jbvpvf.png",
            },
            {
              name: "YouTube",
              icon: "https://res.cloudinary.com/dn16ti55j/image/upload/v1714924618/icons/youtube_bmnxle.jpg",
            },
            {
              name: "Telegram",
              icon: "https://res.cloudinary.com/dn16ti55j/image/upload/v1714924615/icons/telegram_g5xfqx.png",
            },
            {
              name: "Discord",
              icon: "https://res.cloudinary.com/dn16ti55j/image/upload/v1714924621/icons/discord_m68ils.png",
            },
          ],
        },
        _id: false,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
