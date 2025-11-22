import mongoose from "mongoose";

const ChannelRefSchema = new mongoose.Schema({
  channelID: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  type: {
    type: String,
    enum: ["text", "voice", "thread", "forum"],
    default: "text",
  },
  purpose: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: {
    type: Date,
  },
});

const SessionSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  duration: {
    type: Number,
    default: 0,
  },
  players: [{ type: String }],
  dadosRolados: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
  },
});

const CampaignSchema = new mongoose.Schema({
  newRoleID: {
    type: String,
    required: true,
  },
  masterID: {
    type: String,
    required: true,
  },
  generalChannelID: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  sessions: [SessionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CategorySchema = new mongoose.Schema({
  guildID: {
    type: String,
    required: true,
  },
  categoryID: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  channels: [ChannelRefSchema],
  isCampaign: {
    type: Boolean,
    default: false,
  },
  campaignData: {
    type: CampaignSchema,
    default: null,
  },
  status: {
    type: String,
    enum: ["nova", "ativa", "hiato"],
    default: "nova",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Category = mongoose.model("Category", CategorySchema);
