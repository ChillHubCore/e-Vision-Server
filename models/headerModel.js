import mongoose from "mongoose";

const headerSchema = new mongoose.Schema({
  title: { type: String, required: true, minLength: 3, maxLength: 255 },
  logo: { type: String },
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

const Header = mongoose.model("Header", headerSchema);

export default Header;
