import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Define the operationalDurationSchema
const operationalDurationSchema = new Schema({
  totalDuration: { type: String, required: false, default: 0 },
  onTime: { type: String, required: false, default: "" },
  offTime: { type: String, required: false, default: "" },
});

// Define the coordinatesSchema
const coordinatesSchema = new Schema({
  latitude: { type: Number, required: true, default: 0 },
  longitude: { type: Number, required: true, default: 0 },
});

// Define the kmlPolySchema
const kmlPolySchema = new Schema({
  // TODO ADD the schema
});

// Define the screenPlaceSchema
const screenPlaceSchema = new Schema({
  angle: { type: Number, required: true, default: 0 },
  altitude: { type: Number, required: true, default: 0 },
  viewingDistance: { type: Number, required: true, default: 0 },
});

// Define the locationSchema
const locationSchema = new Schema({
  locationId: { type: String, required: false },
  country: { type: String, required: true, default: "" },
  state: { type: String, required: true, default: "" },
  city: { type: String, required: true, default: "" },
  address: { type: String, required: true, default: "" },
  touchPoints: { type: [String], required: true, default: "" },
  pincode: { type: String, required: false, default: "" },
  locationLevel: { type: Number, required: true, default: "" },
  zoneOrRegion: { type: String, required: false, default: "" },
  geographicalLocation: { type: coordinatesSchema, required: true },
  kmlPolygon: { type: kmlPolySchema, required: true },
  entryPoint: { type: coordinatesSchema, required: true },
  screenPlacement: { type: screenPlaceSchema, required: true },
  pointOfInterest: { type: [String], required: true },
});

// Define the cohortPeopleVisitingPercentSchema
const cohortPeopleVisitingPercentSchema = new Schema({
  morning: { type: Number, required: true, default: 0 },
  afternoon: { type: Number, required: true, default: 0 },
  evening: { type: Number, required: true, default: 0 },
  night: { type: Number, required: true, default: 0 },
});

// Define the sub audienceSchema
const subAudienceSchema = new Schema({
  audienceCategory: { type: String, required: false },
  audiencePercentage: { type: Number, required: false },
  sov: { type: Number, required: false },
  cohortPeopleVisitingPercentage: {
    type: cohortPeopleVisitingPercentSchema,
    required: false,
  },
});

// Define the audience Schema
const audienceSchema = new Schema({
  audienceName: { type: String, required: false },
  subAudiences: { type: [subAudienceSchema], required: false },
});

const campaignScreenSchema = new Schema({
  campaignId: { type: String, required: false },
  campaignType: { type: [String], required: false },
});

const defaultVideoSchema = new Schema({
  screenId: { type: String, required: false, default : "" },
  campaignId: { type: String, required: false, default : "" },
  mediaId: { type: String, required: false, default : "" },
  url: { type: String, required: false, default : "" },
  name: { type: String, required: false, default : "" },
  duration: { type: String, required: false, default : "" },
  fileType: { type: String, required: false, default : "" },
  fileSize: { type: Number, required: false, default : 0 },
  atIndex: { type: [Number], required: false, default : [] },
})

// Define the screenSchema
const screenSchema = new Schema({
  screenId: { type: String, required: true, unique: true },
  screenName: { type: String, required: true },
  master: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    default: null,
  },
  masterEmail: { type: String, default: "" },
  screenCode: { type: String, required: false, default: "" },
  screenStatus: { type: String, required: false, default: "active" },
  syncStatus: { type: String, required: false, default: "active" },
  orientation: { type: String, required: false, default: "" },
  images: { type: [String], required: true, default: [] },
  highlights: { type: [String], required: true, default: [] },
  integrationStatus: { type: Boolean, required: true, default: false },
  hardwarePitch: { type: String, required: false, default: "" },
  operationalDuration: { type: operationalDurationSchema, required: false },
  screenResolution: { type: String, required: true, default: "" },
  screenLength: { type: Number, required: true, default: 0 },
  screenWidth: { type: Number, required: true, default: 0 },
  networkType: { type: String, required: false, default: "" },
  totalUnitsAvailable: { type: Number, required: true, default: 0 },
  unitsConnected : {type : [String] , required : false , default : []},
  loopLengthSeconds: { type: Number, required: true, default: 0 },
  slotLengthSeconds: { type: Number, required: true, default: 0 },
  totalSlotForOneBrand: { type: Number, required: true, default: 0 },
  rateForOneDay: { type: Number, required: true, default: 0 },
  dwellTime: { type: String, required: false, default: "" },
  screenType: { type: String, required: true, default: "" },
  totalImpression: { type: Number, required: true, default: 0 },
  cpm: { type: Number, required: true, default: 0 },
  asPerMOP: { type: Number, required: true, default: 0 },
  creativeType: { type: [String], required: true, default: [] },
  sound: { type: Boolean, required: true, default: false },
  masterMediaPlayer: { type: String, required: false, default: "" },
  locationPins: { type: [String], required: true },
  location: { type: locationSchema, required: true },
  audiences: { type: [], required: true },
  dbAudiences: { type: [String]},
  campaigns: { type: [campaignScreenSchema], required: false, default: [] },
  market: { type: String},
  marketSite: { type: String },
  lastActive: { type: String, required: false, default: "dateTime" },
  defaultVideo : { type : defaultVideoSchema , required : false }

});

const poiList = new Schema({
  list: { type: [String], required: true, unique: true },
});

const syncedScreens = new Schema({
  screenIds : {type : [String] , required: false , default : []},
  screenCodes : {type : [String] , required: false , default : []},
  currentIndex : {type : Number , required:false , default : 0},
  maxLength : {type : Number , required : false , default : 0},
  loopLength : {type : Number , required : false , default : 0},
  masterScreen : {type : String , required : false , default : "" },
  lastSynced : {type : String , required : false , default : ""}
}) 

class MapViewResultScreens {
  constructor(screenName, latitude, longitude, images, totalImpression) {
    this.screenName = screenName;
    this.latitude = latitude;
    this.longitude = longitude;
    this.images = images;
    this.totalImpression = totalImpression;
  }
}

class MatchDataResult {
  constructor(
    matchId,
    seriesName,
    matchDescription,
    startDate,
    startTime,
    team1,
    team2,
    ground,
    city,
    country
  ) {
    this.matchId = matchId;
    this.seriesName = seriesName;
    this.matchDescription = matchDescription;
    this.startDate = startDate;
    this.startTime = startTime;
    this.team1 = team1;
    this.team2 = team2;
    this.ground = ground;
    this.city = city;
    this.country = country;
  }
}

class PricingDetails {
  constructor(
    slotPerDay,
    slotPerDayCohort,
    sov,
    sovCohort,
    impressionPerDay,
    impressionPerDayCohort,
    priceForDay,
    priceForDayCohort
  ) {
    (this.slotPerDay = slotPerDay),
      (this.slotPerDayCohort = slotPerDayCohort),
      (this.sov = sov),
      (this.sovCohort = sovCohort),
      (this.impressionPerDay = impressionPerDay),
      (this.impressionPerDayCohort = impressionPerDayCohort),
      (this.priceForDay = priceForDay),
      (this.priceForDayCohort = priceForDayCohort),
      (this.cpm = (priceForDay * 1000) / impressionPerDay),
      (this.cpmCohort = (priceForDayCohort * 1000) / impressionPerDayCohort);
  }
}

class MapDataFiltered {
  constructor(
    screenId,
    screenName,
    screenResolution,
    slotLengthSeconds,
    screenLength,
    images , 
    highlights , 
    screenWidth,
    latitude,
    longitude,
    orientation,
    pointOfInterest,
    rateForOneDay
  ) {
    (this.screenId = screenId),
      (this.screenName = screenName),
      (this.screenResolution = screenResolution),
      (this.slotLengthSeconds = slotLengthSeconds),
      (this.screenLength = screenLength),
      (this.images = images),
      (this.highlights = highlights),
      (this.screenWidth = screenWidth),
      (this.latitude = latitude),
      (this.longitude = longitude),
      (this.orientation = orientation),
      (this.pointOfInterest = pointOfInterest);
      this.rateForOneDay = rateForOneDay;
  }
}

class ScreenDataFinalSummary {
  constructor(
    address,
    integrationStatus,
    hardwarePitch,
    geographicalLocation,
    pincode,
    operationalDuration,
    screenResolution,
    screenLength,
    screenWidth,
    networkType,
    loopLengthSeconds,
    slotLengthSeconds,
    slotTaken,
    cohortSlots
  ) {
    (this.address = address),
      (this.integrationStatus = integrationStatus),
      (this.hardwarePitch = hardwarePitch),
      (this.geographicalLocation = geographicalLocation),
      (this.pincode = pincode),
      (this.operationalDuration = operationalDuration),
      (this.screenResolution = screenResolution),
      (this.screenLength = screenLength),
      (this.screenWidth = screenWidth),
      (this.networkType = networkType),
      (this.loopLengthSeconds = loopLengthSeconds),
      (this.slotLengthSeconds = slotLengthSeconds),
      (this.slotTaken = slotTaken),
      (this.cohortSlots = cohortSlots);
  }
}

const SyncedScreen = mongoose.model("SyncedScreen" , syncedScreens)
const Screen = mongoose.model("Screen", screenSchema);
const PoiList = mongoose.model("PoiList", poiList);
const DefaultVideo = mongoose.model("DefaultVideo" , defaultVideoSchema);

export {
  Screen,
  PoiList,
  MapViewResultScreens,
  MatchDataResult,
  PricingDetails,
  MapDataFiltered,
  ScreenDataFinalSummary,
  SyncedScreen,
  DefaultVideo
};
