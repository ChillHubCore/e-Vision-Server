import TelegramBot from "node-telegram-bot-api";
import VerificationCode from "../models/verificationCodeModel.js";
import User from "../models/userModel.js";
import expressAsyncHandler from "express-async-handler";

export function telegramBot() {
  const bot = new TelegramBot(
    process.env.ENV === "production"
      ? process.env.TELEGRAM_BOT_API
      : process.env.TELEGRAM_DEVBOT_API,
    { polling: true },
  );

  bot.on(
    "message",
    expressAsyncHandler(async (msg) => {
      // console.log(msg);
      const chatId = msg.chat.id;
      const chatUsername = msg.chat.username;
      const chatText = msg.text;
      if (chatText.startsWith("tg-") && chatText.length === 11) {
        try {
          const user = await User.findOne({
            telegramInfo: {
              chatUsername: chatUsername,
            },
          });
          if (user && user.telegramInfo.verified === false) {
            const ValidationCodeCheck = await VerificationCode.findOne({
              user: user._id,
              code: chatText,
              platform: "telegram",
            });
            if (ValidationCodeCheck) {
              user.telegramInfo = {
                chatId,
                chatUsername,
                verified: true,
              };

              await user.save();
              bot.sendMessage(chatId, "Telegram Verified Successfully!");
            } else {
              bot.sendMessage(chatId, "Invalid Code!");
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    }),
  );
}
