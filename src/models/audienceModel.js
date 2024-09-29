import mongoose from "mongoose";

const Schema = mongoose.Schema;

const geoSchema = new Schema({
  lat: { type: Number },
  lng: { type: Number },
});

const audienceSchema = new Schema({
  location: { type: String, required: true},
  geo: {type: [geoSchema]},
  data: {
    totalAudience: {},
    audience: []
  }
});
const Audience = mongoose.model("Audience", audienceSchema);


export {
  Audience,
};
