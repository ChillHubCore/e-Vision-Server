import dotenv from "dotenv";

dotenv.config();

export const EmailContentEncryptionKeys = [
  {
    keyVersion: 1,
    encryptionKey: process.env.MESSAGE_ENCRYPTION_KEY_1,
  },
];
