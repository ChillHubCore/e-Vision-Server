import Product from "../models/productModel.js";
import User from "../models/userModel.js";

export async function SendNotificationForOneUser({ userId, title, message }) {
  const user = await User.findById(userId);
  if (user) {
    user.notifications.push({ title, message });
    await user.save();
  }
}

export function inStockCheck(cartItems) {
  const inStockCheckFlag = cartItems.map(async (item) => {
    const product = await Product.findById(item.product);
    if (product) {
      const variant = product.variants.find(
        (v) => v._id.toString() === item.variant,
      );
      if (variant) {
        if (variant.inStock < item.quantity && variant.availability === true) {
          return res.status(400).send({
            message: `Sorry, ${product.name} ${variant.name} is out of stock or currently unavailable.`,
          });
        }
      }
    }
  });
  return Promise.all(inStockCheckFlag);
}
