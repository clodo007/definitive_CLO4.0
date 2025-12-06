import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema({
  guildID: {
    type: String,
    required: true,
  },
  roleID: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
  },
  isLevelRole: {
    type: Boolean,
    default: false,
  },
  isCampaignRole: {
    type: Boolean,
    default: false,
  },
  levelRequired: {
    type: Number,
    default: 0,
  },
  isStaffRole: {
    type: Boolean,
    default: false,
  },
  isMasterRole: {
    type: Boolean,
    default: false,
  },
  isPartnerRole: {
    type: Boolean,
    default: false,
  },
  isBoosterRole: {
    type: Boolean,
    default: false,
  },
  isNotificationRole: {
    type: Boolean,
    default: false,
  },
  isArtistRole: {
    type: Boolean,
    default: false,
  },
  isGuestRole: {
    type: Boolean,
    default: false,
  },
  membersWhoHasTheRole: [{ type: String }],
  permissions: [
    {
      name: { type: String },
      value: { type: Boolean, default: false },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Role = mongoose.model("Role", RoleSchema);
