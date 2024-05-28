import mongoose from "mongoose";

const footerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleClassName: {
    type: String,
    // minLength: 3,
    maxLength: 255,
  },
  containerClassName: {
    type: String,
    // minLength: 3,
    maxLength: 255,
  },
});

const Footer = mongoose.model("Footer", footerSchema);

export default Footer;
