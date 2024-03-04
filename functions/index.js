import Product from "../models/productModel.js";
import User from "../models/userModel.js";

export async function SendNotificationForOneUser({ userId, title, message }) {
  const user = await User.findById(userId);
  if (user) {
    user.notifications.push({ title, message });
    await user.save();
  }
}

export async function inStockCheck(cartItems) {
  const inStockCheckFlag = cartItems.map(async (item) => {
    const product = await Product.findById(item.product);
    if (product) {
      const variant = product.variants.find(
        (v) => v._id.toString() === item.variant,
      );
      if (variant) {
        if (variant.inStock < item.quantity || variant.availability === false) {
          throw new Error(`Insufficient stock for product ${product._id}`);
        }
      }
    }
  });
  return Promise.all(inStockCheckFlag);
}
