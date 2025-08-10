import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    login: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    emailConfirmation: {
      isConfirmed: { type: Boolean, default: false },
      confirmationCode: { type: String, default: null },
      expirationDate: { type: Date, default: null },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

userSchema.index({ login: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ "emailConfirmation.confirmationCode": 1 });

export const UserModel = mongoose.model("User", userSchema);
