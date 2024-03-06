import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    closedAt: {
      type: Date,
    },
    closedNote: {
      type: String,
      maxLength: 1023,
    },
    title: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 127,
    },
    description: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 1023 * 20,
    },
    attachments: {
      type: [String],
    },
    status: {
      type: String,
      enum: ["Open", "In-Progress", "Closed", "Pending"],
      default: "Open",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Low",
    },
    ticketType: {
      type: String,
      enum: [
        "Bug/Error",
        "Feature Request",
        "Product Consultation",
        "Order Issue",
        "Transaction Issue",
        "Feedback",
        "Other",
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
