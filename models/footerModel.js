import mongoose from "mongoose";

const footerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleStyle: {
    color: { type: String },
    colorWeight: { type: String },
    fontSize: { type: String },
    fontWeight: { type: String },
    cursor: { type: String },
  },
  backgroundStyle: {
    color: { type: String },
    colorWeight: { type: String },
    isSticky: { type: Boolean },
  },
});

const Footer = mongoose.model("Footer", footerSchema);

export default Footer;
