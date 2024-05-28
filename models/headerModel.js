import mongoose from "mongoose";

const headerSchema = new mongoose.Schema({
  title: { type: String, required: true, minLength: 3, maxLength: 255 },
  logo: { type: String },
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

const Header = mongoose.model("Header", headerSchema);

export default Header;
