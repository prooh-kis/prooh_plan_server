import mongoose, { Schema } from "mongoose";
import {
  CAMPAIGN_STATUS_PENDING,
  CAMPAIGN_TYPE_REGULAR,
  CAMPAIGN_TYPE_SPECIAL,
} from "../constants/campaignConstant.js";

const pleaRequestSchema = new mongoose.Schema({
  type: { type: String, required: false },
  sender: { type: String, required: false },
  receiver: { type: String, required: false },
  time: { type: String, required: false },
  status: { type: String, required: false },
});

const slotsPlayedPerDaySchema = new mongoose.Schema({
  date: { type: String, required: true, default: "" },
  count: { type: Number, required: true, default: 0 },
});

const singleMedia = new mongoose.Schema({
  videoURL: { type: String, required: true },
  fileType: { type: String, default: "" }, // file type  ex image/png , video/mp4, video/mkv
  duration: { type: String, default: 10 }, // length of video file in second
  fileSize: { type: Number, default: 0 }, // file size on Kb
});

const campaignSchema = new mongoose.Schema(
  {
    campaignWithMultipleMediasWithMultipleScreens: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "campaignWithMultipleMediasWithMultipleScreens",
      required: true,
    },
    name: { type: String, required: true },
    brandName: { type: String, required: true, default: "Brand" },

    startDate: { type: Date },
    endDate: { type: Date },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screen",
      required: true,
    },
    screenName: { type: String, required: true },
    videoURL: { type: String, required: true },
    status: { type: String, default: CAMPAIGN_STATUS_PENDING },
    campaignType: {
      type: String,
      default: CAMPAIGN_TYPE_REGULAR,
      // enum: [CAMPAIGN_TYPE_REGULAR, CAMPAIGN_TYPE_SPECIAL],
    },
    isDefaultCampaign: { type: Boolean, default: false },

    // media related info
    fileType: { type: String, default: "" }, // file type  ex image/png , video/mp4, video/mkv
    duration: { type: String, default: 10 }, // length of video file in second
    fileSize: { type: Number, default: 0 }, // file size on Kb

    // slot related info..  (optional)
    campaignBookedForDays: { type: Number, default: 0 },
    totalSlotBooked: { type: Number, default: 0 }, // no. of days * screen.maximumSlotPlayPerDay
    remainingSlots: { type: Number, default: 0 },
    totalSlotsPlayed: { type: Number, default: 0 }, // slots played by campaign each days
    todaySlotsPlayed: { type: Number, default: 0 }, // slots played by campaign each days
    slotsPlayedPerDay: { type: [slotsPlayedPerDaySchema], default: [] },

    rentPerSlot: { type: Number, default: 0 }, // rent of 1 slot of a campaign  =  screen.rentPerDay/screen.maximumSlotPlayPerDay
    rentPerDay: { type: Number, default: 0 }, //  =  screen.rentPerDay
    maximumSlotPlayPerDay: { type: Number, default: 0 }, // = screen.maximumSlotPlayPerDay
    totalAmount: { type: Number, default: 0 }, // cost of this single campaign

    isTriggers: { type: Boolean, default: false },
    triggers: {
      timeTriggers: [],
      weatherTriggers: [],
      cricketTriggers: [],
      medias: [singleMedia],
    },
    audiancesData: [],
    atIndex: [{ type: Number }],
    lastActive: { type: Boolean, default: false },

    primaryCampaignManger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: "6687a6d79052da08eb07ba3b",
    },
    primaryCampaignMangerEmail: {
      type: String,
      required: false,
      default: "prooh.aiaws@gmail.com",
    },

    secondaryCampaignManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: "6687a6d79052da08eb07ba3b",
    },
    secondaryCampaignManagerEmail: {
      type: String,
      required: false,
      default: "prooh.aiaws@gmail.com",
    },

    primaryScreenOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: "6687a6d79052da08eb07ba3b",
    },
    primaryScreenOwnerEmail: {
      type: String,
      required: false,
      default: "prooh.aiaws@gmail.com",
    },

    pleaRequests: { type: [pleaRequestSchema], required: false, default: [] },

    historyForMediaChange: [
      {
        oldVideoURl: { type: String },
        oldConfig: {},
        changeDate: { type: Date, default: new Date() },
      },
    ],
  },
  { timestamps: true }
);

class ScreenVideoResponse {
  constructor(
    screenId,
    campaignId,
    mediaId,
    url,
    name,
    duration,
    fileSize,
    fileType,
    atIndex
  ) {
    this.screenId = screenId;
    this.campaignId = campaignId;
    this.mediaId = mediaId;
    this.url = url;
    this.name = name;
    this.duration = duration;
    this.fileSize = fileSize;
    this.fileType = fileType;
    this.atIndex = atIndex;
  }
}

class RearrangeScreenVideoResponse {
  constructor(mediaId, index) {
    (this.mediaId = mediaId), (this.index = index);
  }
}

const Campaign = mongoose.model("Campaign", campaignSchema);
const PleaRequest = mongoose.model("PleaRequest", pleaRequestSchema);
const SlotPlayPerDay = mongoose.model(
  "SlotPlayPerDay",
  slotsPlayedPerDaySchema
);

export {
  Campaign,
  ScreenVideoResponse,
  RearrangeScreenVideoResponse,
  PleaRequest,
  SlotPlayPerDay,
};
