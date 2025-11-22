import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
  },
  guildID: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  campaignIDs: [{ type: String }],
  mesasJogadas: {
    type: Number,
    default: 0,
  },
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  levelRoleID: {
    type: String,
  },
  dadosRoladosTotal: {
    type: Number,
    default: 0,
  },
  horasJogadasTotal: {
    type: Number,
    default: 0,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  isMaster: {
    type: Boolean,
    default: false,
  },
  isArtist: {
    type: Boolean,
    default: false,
  },
  isPartner: {
    type: Boolean,
    default: false,
  },
  isBooster: {
    type: Boolean,
    default: false,
  },
  isManager: {
    type: Boolean,
    default: false,
  },
  isGuest: {
    type: Boolean,
    default: false,
  },
});

export const User = mongoose.model("User", UserSchema);
