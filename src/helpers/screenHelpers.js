import Axios from "axios";
import {
  GOOGLE_MAPS_API_BASE_URL, CRICBUZZ_API_BASE_URL, GOOGLE_MAPS_API_MAX_COUNT,
  GOOGLE_MAPS_API_RADIUS, CAMPAIGN_COUNT, SCREEN_COUNT, IMPRESSION_COUNT, PAUSE_STATUS, PLAY_STATUS
} from "../constants/Constant.js";
import {
  MapDataFiltered, MapViewResultScreens, MatchDataResult,
  PricingDetails, ScreenDataFinalSummary, Screen,
  SyncedScreen
} from "../models/screenModel.js";
import { Campaign } from "../models/campaignModel.js";
import { INACTIVE } from "../constants/messagingConstant.js";
import { broadcast } from "../broadcast/broadcastModel.js";
import { CAMPAIGN_STATUS_ACTIVE, CAMPAIGN_STATUS_HOLD, CAMPAIGN_STATUS_PAUSE } from "../constants/campaignConstant.js";

const MAPS_API_KEY = "AIzaSyBFcSh_kvai4oqT0_8wrBcEeJpj0f1PNIs";
const MAPS_FIELD_MASK = "places.displayName,places.types";

export const getCricketMatchesListData = async () => {
  try {
    const apiKey = process.env.CRICBUZZ_API_KEY || "2b614c2009msh4632259e3a45c71p117a30jsn3f3f75fc618c";
    const host = process.env.CRICBUZZ_HOST || "cricbuzz-cricket.p.rapidapi.com";
    const url = CRICBUZZ_API_BASE_URL + `schedule/v1/international`;
    const options = {
      method: "GET",
      url: url,
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": host,
      },
    };
    var response = await Axios.request(options);
    response = response.data.matchScheduleMap;
    var result = [];
    for (const matchMap of response) {
      const data = matchMap.scheduleAdWrapper;
      if (!data) continue;

      for (const series of data.matchScheduleList) {
        for (const cricketMatch of series.matchInfo) {
          var epochDate = Number(cricketMatch.startDate);
          var date = new Date(epochDate);
          var hours = date.getHours();
          var minutes = "0" + date.getMinutes();
          var seconds = "0" + date.getSeconds();
          var formattedTime =
            hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
          const match = new MatchDataResult(
            cricketMatch.matchId,
            series.seriesName,
            cricketMatch.matchDesc,
            data.date,
            formattedTime,
            cricketMatch.team1.teamName,
            cricketMatch.team2.teamName,
            cricketMatch.venueInfo.ground,
            cricketMatch.venueInfo.city,
            cricketMatch.venueInfo.country
          );
          result.push(match);
        }
      }
    }
    return result;
  } catch (error) {
    return { error: "Failed to fetch list of matches" };
  }
};

export const getMatchPlayersList = async (id) => {
  var result = {}

  const apiKey = process.env.CRICBUZZ_API_KEY || "2b614c2009msh4632259e3a45c71p117a30jsn3f3f75fc618c";
  const host = process.env.CRICBUZZ_HOST || "cricbuzz-cricket.p.rapidapi.com";
  const url = CRICBUZZ_API_BASE_URL + `mcenter/v1/${id}`;
  const options = {
    method: "GET",
    url: url,
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": host,
    },
  };
  var response = await Axios.request(options);
  response = response.data.matchInfo

  var { team1, team2 } = response
  var team1Name = team1.name
  var team2Name = team2.name
  team1 = team1.playerDetails
  team2 = team2.playerDetails

  var arrayTeam1 = []
  var arrayTeam2 = []

  for (var i = 0; i < team1.length; i++) {
    arrayTeam1.push(team1[i].fullName)
    arrayTeam2.push(team2[i].fullName)
  }
  result[team1Name] = arrayTeam1
  result[team2Name] = arrayTeam2

  return result
}

export function convertScreenDataToMapTableData(data) {
  var result = {};
  for (const screen of data) {
    const { location } = screen;
    const { country, state, city, touchPoints } = location;
    var exist = true;

    if (!result[country]) {
      result[country] = {};
      exist = false;
    }
    if (!result[country][state]) {
      result[country][state] = {};
      exist = false;
    }

    if (!result[country][state][city]) {
      result[country][state][city] = {};
      exist = false;
    }

    for (const touchPoint of touchPoints) {
      if (!result[country][state][city][touchPoint]) {
        result[country][state][city][touchPoint] = [screen._id];
        exist = false;
      }

      if (exist) {
        result[country][state][city][touchPoint].push(screen._id);
      }
    }
  }
  return result;
}

// Function to process the screenData and convert it to HomePageTableData format
export const convertScreenDataToHomeTableData = async () => {
  const screenData = await Screen.find();
  if (!screenData)
    return ({ message: "No Screen Available" });
  var result = {};
  for (const screen of screenData) {
    const { location } = screen;
    const { country, state, city, touchPoints } = location;
    var exist = true;

    if (!result[country]) {
      result[country] = {};
      exist = false;
    }
    if (!result[country][state]) {
      result[country][state] = {};
      exist = false;
    }

    if (!result[country][state][city]) {
      result[country][state][city] = {};
      exist = false;
    }

    for (const touchPoint of touchPoints) {
      if (!result[country][state][city][touchPoint]) {
        result[country][state][city][touchPoint] = 1;
        exist = false;
      }

      if (exist) {
        result[country][state][city][touchPoint]++;
      }
    }
  }
  return result;
}

export const calculateHomeScreenCounts = async () => {
  var results = {}
  var screenCount = await Screen.countDocuments();
  var impressionCount = await Screen.aggregate([
    { $group: { _id: null, total: { $sum: "$totalImpression" } } }
  ])
  impressionCount = impressionCount[0].total
  var campaignCount = await Campaign.countDocuments();

  results[CAMPAIGN_COUNT] = campaignCount
  results[SCREEN_COUNT] = screenCount
  results[IMPRESSION_COUNT] = impressionCount
  return results
}

export function filterScreenDataForMapView(
  data,
  countries,
  states,
  cities,
  touches
) {
  var result = [];
  for (const screen of data) {
    const { location, screenName, images, totalImpression } = screen;
    const { country, state, city, touchPoints, geographicalLocation } =
      location;
    const { latitude, longitude } = geographicalLocation;
    if (
      countries.includes(country) &&
      states.includes(state) &&
      cities.includes(city)
    ) {
      var exists = false;
      for (const touch of touches) {
        if (touchPoints.includes(touch)) {
          exists = true;
          break;
        }
      }

      if (exists) {
        const mapView = new MapViewResultScreens(
          screenName,
          latitude,
          longitude,
          images,
          totalImpression
        );
        result.push(mapView);
      }
    }
  }
  return result;
}

export function convertScreenDataToAudienceTableData(data) {
  var result = {};
  var count = {};
  for (const screen of data) {
    const { location, audiences } = screen;
    const { country, state, city, touchPoints } = location;

    if (!result[country]) {
      result[country] = {};
      count[country] = {};
    }
    if (!result[country][state]) {
      result[country][state] = {};
      count[country][state] = {};
    }

    if (!result[country][state][city]) {
      result[country][state][city] = {};
      count[country][state][city] = {};
    }

    for (const touchPoint of touchPoints) {
      if (!result[country][state][city][touchPoint]) {
        result[country][state][city][touchPoint] = {};
        count[country][state][city][touchPoint] = {};
      }

      for (const audience of audiences) {
        const { audienceName, subAudiences } = audience;
        if (!result[country][state][city][touchPoint][audienceName]) {
          result[country][state][city][touchPoint][audienceName] = {};
          count[country][state][city][touchPoint][audienceName] = {};
        }

        for (const subAudience of subAudiences) {
          const { audienceCategory, audiencePercentage } = subAudience;
          if (
            !result[country][state][city][touchPoint][audienceName][
            audienceCategory
            ]
          ) {
            result[country][state][city][touchPoint][audienceName][
              audienceCategory
            ] = audiencePercentage;
            count[country][state][city][touchPoint][audienceName][
              audienceCategory
            ] = 1;
          } else {
            let percentOld =
              result[country][state][city][touchPoint][audienceName][
              audienceCategory
              ];
            let countOld =
              count[country][state][city][touchPoint][audienceName][
              audienceCategory
              ];
            let percentNew =
              (percentOld * countOld + audiencePercentage) / (countOld + 1);
            result[country][state][city][touchPoint][audienceName][
              audienceCategory
            ] = percentNew;
            count[country][state][city][touchPoint][audienceName][
              audienceCategory
            ]++;
          }
        }
      }
    }
  }
  return result;
}

export const convertScreenDataToMapViewData = async () => {
  const screenData = await Screen.find();
  if (!screenData)
    return ({ message: "No Screen Available" });
  var result = {};
  for (const screen of screenData) {
    const { location, screenName, images, totalImpression, _id } = screen;
    const { country, state, city, touchPoints, geographicalLocation } =
      location;
    const { latitude, longitude } = geographicalLocation;

    if (!result[country]) {
      result[country] = {};
    }
    if (!result[country][state]) {
      result[country][state] = {};
    }

    if (!result[country][state][city]) {
      result[country][state][city] = {};
    }

    for (const touchPoint of touchPoints) {
      if (!result[country][state][city][touchPoint]) {
        result[country][state][city][touchPoint] = {};
      }
      const mapView = new MapViewResultScreens(
        screenName,
        latitude,
        longitude,
        images,
        totalImpression
      );
      result[country][state][city][touchPoint][_id] = mapView;
    }
  }
  return result;
}

export function convertScreenDataToFinalSummaryTableData(
  data,
  selectedScreens
) {
  var result = {};
  for (const screen of data) {
    const { location, _id, screenName, highlights } = screen;
    const { country, state, city, touchPoints } = location;
    for (const selectedScreen of selectedScreens) {
      const {
        selectedCountry,
        selectedState,
        selectedCity,
        selectedTouchPoint,
      } = selectedScreen;
      if (
        selectedCountry == country &&
        selectedState == state &&
        selectedCity == city &&
        touchPoints.includes(selectedTouchPoint)
      ) {
        if (!result[country]) {
          result[country] = {};
        }
        if (!result[country][state]) {
          result[country][state] = {};
        }

        if (!result[country][state][city]) {
          result[country][state][city] = {};
        }

        if (!result[country][state][city][selectedTouchPoint]) {
          result[country][state][city][selectedTouchPoint] = {};
        }
        if (!result[country][state][city][selectedTouchPoint][highlights]) {
          result[country][state][city][selectedTouchPoint][highlights] = {};
        }
        result[country][state][city][selectedTouchPoint][highlights][_id] = screenName;
      }
    }
  }
  return result;
}

export function convertScreenDataToPricingDetailsTable(data, screenData) {

  var result = {}
  const { selectedList, screenIds } = data

  for (const selection of selectedList) {
    const { selectedCountry, selectedState, selectedCity, selectedTouchPoints, selectedAudiences } = selection
    for (const screen of screenData) {
      if (!screenIds.includes(screen.screenId))
        continue;

      var morningCount = 0,
        afternoonCount = 0,
        eveningCount = 0,
        nightCount = 0,
        morningSov = 0,
        afternoonSov = 0,
        eveningSov = 0,
        nightSov = 0,
        percentSum = 0,
        totalPercent = 0,
        cohortTotalCount = 0,
        slotPerDay = 0,
        slotPerDayCohort = 0,
        sov = 0,
        sovCohort = 0,
        impressionPerDay = 0,
        impressionPerDayCohort = 0,
        priceForDay = 0,
        priceForDayCohort = 0
      const { location, audiences, totalImpression, rateForOneDay, campaigns, operationalDuration, slotLengthSeconds } = screen;
      const { country, state, city, touchPoints } = location;
      const maxPercentArray = new Set();

      for (const selectedTouchPoint of selectedTouchPoints) {
        if (selectedCountry == country && selectedState == state && selectedCity == city && touchPoints.includes(selectedTouchPoint)) {
          for (const selectedAudience of selectedAudiences) {
            for (const audience of audiences) {
              for (const subAudience of audience.subAudiences) {
                const cohortPeople = subAudience.cohortPeopleVisitingPercentage
                totalPercent += (cohortPeople.morning + cohortPeople.afternoon + cohortPeople.evening + cohortPeople.night)
                if (audience.audienceName == selectedAudience.audienceCategory &&
                  subAudience.audienceCategory == selectedAudience.subAudienceCategory) {

                  var maxPercent = 0
                  maxPercent = Math.max(cohortPeople.morning,
                    Math.max(cohortPeople.afternoon, Math.max(cohortPeople.evening, cohortPeople.night)))
                  if (maxPercent == cohortPeople.morning) {
                    maxPercentArray.add("morning");
                    percentSum += maxPercent
                  }
                  if (maxPercent == cohortPeople.afternoon) {
                    maxPercentArray.add("afternoon");
                    percentSum += maxPercent
                  }
                  if (maxPercent == cohortPeople.evening) {
                    maxPercentArray.add("evening");
                    percentSum += maxPercent
                  }
                  if (maxPercent == cohortPeople.night) {
                    maxPercentArray.add("night");
                    percentSum += maxPercent
                  }
                }
              }
            }
          }

          if (maxPercentArray.size > 0) {
            totalPercent /= selectedAudiences.length
            const totalSlots = operationalDuration.totalDuration / slotLengthSeconds;
            slotPerDay += totalSlots
            impressionPerDay += totalImpression
            priceForDay += rateForOneDay
            slotPerDayCohort += ((totalSlots * maxPercentArray.size) / 4)
            impressionPerDayCohort += (percentSum * totalImpression) / totalPercent
            const cohortSingleSlotPrice = (1.1 * rateForOneDay) / totalSlots
            priceForDayCohort += (slotPerDayCohort * cohortSingleSlotPrice)

            for (const campaign of campaigns) {
              for (const type of campaign.campaignType) {
                if (type == "morning")
                  morningCount++
                else if (type == "afternoon")
                  afternoonCount++
                else if (type == "evening")
                  eveningCount++
                else
                  nightCount++
              }
            }
            morningCount++
            afternoonCount++
            eveningCount++
            nightCount++

            morningSov = (100 / morningCount)
            afternoonSov = (100 / afternoonCount)
            eveningSov = (100 / eveningCount)
            nightSov = (100 / nightCount)

            var sovCohortCalc = 0
            if (maxPercentArray.has("morning"))
              sovCohortCalc += morningSov
            if (maxPercentArray.has("afternoon"))
              sovCohortCalc += afternoonSov
            if (maxPercentArray.has("evening"))
              sovCohortCalc += eveningSov
            if (maxPercentArray.has("night"))
              sovCohortCalc += nightSov

            sov += ((morningSov + afternoonSov + eveningSov + nightSov) / 4)
            sovCohort += (sovCohortCalc / maxPercentArray.size)

            const pricingDetail = new PricingDetails(slotPerDay, slotPerDayCohort, sov,
              sovCohort, impressionPerDay, impressionPerDayCohort, priceForDay, priceForDayCohort)

            if (!result[selectedCountry]) {
              result[selectedCountry] = {};
            }
            if (!result[selectedCountry][selectedState]) {
              result[selectedCountry][selectedState] = {};
            }
            if (!result[selectedCountry][selectedState][selectedCity]) {
              result[selectedCountry][selectedState][selectedCity] = {};
            }
            result[selectedCountry][selectedState][selectedCity][screen.screenId] = pricingDetail

            break;
          }
        }
      }
    }
  }

  return result
}

export function convertScreenDataToFilterMapData(data, screenData) {
  var result = {}
  for (const selection of data) {
    const { selectedCountry, selectedState, selectedCity, selectedTouchPoints, selectedAudiences } = selection

    for (const screen of screenData) {
      const { location, audiences, screenId, screenName, screenResolution, slotLengthSeconds, screenLength, screenWidth, orientation,
        images, highlights , rateForOneDay } = screen;
      const { country, state, city, touchPoints } = location;

      var selectScreen = false

      for (const selectedTouchPoint of selectedTouchPoints) {
        if (selectedCountry == country && selectedState == state && selectedCity == city && touchPoints.includes(selectedTouchPoint)) {
          for (const selectedAudience of selectedAudiences) {
            for (const audience of audiences) {
              for (const subAudience of audience.subAudiences) {
                if (audience.audienceName == selectedAudience.audienceCategory &&
                  subAudience.audienceCategory == selectedAudience.subAudienceCategory) {
                  selectScreen = true
                }
                if (selectScreen)
                  break;
              }
              if (selectScreen)
                break;
            }
            if (selectScreen)
              break;
          }
          if (selectScreen)
            break;
        }
      }

      if (selectScreen) {

        const mapDataFiltered = new MapDataFiltered(screenId, screenName, screenResolution, slotLengthSeconds, screenLength, images, highlights,
          screenWidth, location.geographicalLocation.latitude, location.geographicalLocation.longitude, orientation, location.pointOfInterest , rateForOneDay)

        if (!result[selectedCountry]) {
          result[selectedCountry] = {};
        }
        if (!result[selectedCountry][selectedState]) {
          result[selectedCountry][selectedState] = {};
        }

        if (!result[selectedCountry][selectedState][selectedCity]) {
          result[selectedCountry][selectedState][selectedCity] = [];
        }
        result[selectedCountry][selectedState][selectedCity].push(mapDataFiltered)
      }
    }
  }

  return result
}

export function convertScreenDataToScreenDetailsFinalSummary(screen, selectedAudiences, isCohort) {

  if (!isCohort) {
    const result = new ScreenDataFinalSummary(screen.location.address, screen.integrationStatus, screen.hardwarePitch,
      screen.location.geographicalLocation, screen.location.pincode, screen.operationalDuration, screen.screenResolution,
      screen.screenLength, screen.screenWidth, screen.networkType, screen.loopLengthSeconds, screen.slotLengthSeconds, 4, [])

    return result
  } else {
    var cohortSlots = []
    for (const selectedAudience of selectedAudiences) {
      for (const audience of screen.audiences) {
        for (const subAudience of audience.subAudiences) {
          const cohortPeople = subAudience.cohortPeopleVisitingPercentage
          if (audience.audienceName == selectedAudience.audienceCategory &&
            subAudience.audienceCategory == selectedAudience.subAudienceCategory) {

            var maxPercent = Math.max(cohortPeople.morning,
              Math.max(cohortPeople.afternoon, Math.max(cohortPeople.evening, cohortPeople.night)))
            if (maxPercent == cohortPeople.morning && !cohortSlots.includes("morning")) {
              cohortSlots.push("morning");
            }
            if (maxPercent == cohortPeople.afternoon && !cohortSlots.includes("afternoon")) {
              cohortSlots.push("afternoon");
            }
            if (maxPercent == cohortPeople.evening && !cohortSlots.includes("evening")) {
              cohortSlots.push("evening");
            }
            if (maxPercent == cohortPeople.night && !cohortSlots.includes("night")) {
              cohortSlots.push("night");
            }
          }
        }
      }
    }

    const result = new ScreenDataFinalSummary(screen.location.address, screen.integrationStatus, screen.hardwarePitch,
      screen.location.geographicalLocation, screen.location.pincode, screen.operationalDuration, screen.screenResolution,
      screen.screenLength, screen.screenWidth, screen.networkType, screen.loopLengthSeconds, screen.slotLengthSeconds, cohortSlots.length,
      cohortSlots)

    return result
  }
}

export function convertScreenDataToCohortSlotsAllScreens(screenData, data) {

  var result = {}
  const { selectedList, screenIds } = data

  for (const screen of screenData) {
    if (screenIds.includes(screen.screenId)) {
      var cohortSlots = []

      for (const selection of selectedList) {
        const { selectedCountry, selectedState, selectedCity, selectedAudiences } = selection
        if (selectedCountry == screen.location.country && selectedState == screen.location.state && selectedCity == screen.location.city) {
          for (const selectedAudience of selectedAudiences) {
            for (const audience of screen.audiences) {
              for (const subAudience of audience.subAudiences) {
                const cohortPeople = subAudience.cohortPeopleVisitingPercentage
                if (audience.audienceName == selectedAudience.audienceCategory &&
                  subAudience.audienceCategory == selectedAudience.subAudienceCategory) {

                  var maxPercent = Math.max(cohortPeople.morning,
                    Math.max(cohortPeople.afternoon, Math.max(cohortPeople.evening, cohortPeople.night)))
                  if (maxPercent == cohortPeople.morning && !cohortSlots.includes("morning")) {
                    cohortSlots.push("morning");
                  }
                  if (maxPercent == cohortPeople.afternoon && !cohortSlots.includes("afternoon")) {
                    cohortSlots.push("afternoon");
                  }
                  if (maxPercent == cohortPeople.evening && !cohortSlots.includes("evening")) {
                    cohortSlots.push("evening");
                  }
                  if (maxPercent == cohortPeople.night && !cohortSlots.includes("night")) {
                    cohortSlots.push("night");
                  }
                }
              }
            }
          }
        }
      }
      result[screen.screenId] = cohortSlots
    }
  }

  return result
}

export const updatePoiInEveryScreen = async (screenData, listData) => {

  for (var screen of screenData) {
    for (const data of listData.list) {
      const addPoi = await doesPlaceExist(screen.location.geographicalLocation.latitude,
        screen.location.geographicalLocation.longitude, data)
      if (addPoi && !screen.location.pointOfInterest.includes(data)) {
        screen.location.pointOfInterest.push(data)
      }
    }
  }

  return screenData
}

export const setScreenStatusToInActive = async () => {
  try {
    const response = await Screen.updateMany(
      {},
      { $set: { screenStatus: INACTIVE } }
    );
    return response;
  } catch (error) {
    return error.message
  }
}

export const resyncAllScreens = async (syncedScreens) => {
  try {
    broadcast(PAUSE_STATUS);
    setTimeout(async () => {
      broadcast(PLAY_STATUS);
    }, 10000)
    // await cronJobToResyncAllScreens(syncedScreens._id)
    return response;
  } catch (error) {
    return error.message
  }
}

const doesPlaceExist = async (latitude, longitude, placeData) => {
  try {
    const apiKey = process.env.MAPS_API_KEY || MAPS_API_KEY;
    const fieldMask = process.env.MAPS_FIELD_MASK || MAPS_FIELD_MASK;
    const url = GOOGLE_MAPS_API_BASE_URL + `places:searchNearby`;
    const placePoi = []
    placePoi.push(placeData)
    const options = {
      method: "POST",
      url: url,
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fieldMask,
        "Content-Type": "application/json"
      },
      data: JSON.stringify({
        "includedTypes": placePoi,
        "maxResultCount": GOOGLE_MAPS_API_MAX_COUNT,
        "locationRestriction": {
          "circle": {
            "center": {
              "latitude": latitude,
              "longitude": longitude
            },
            "radius": GOOGLE_MAPS_API_RADIUS
          }
        }
      })
    };
    var response = await Axios.request(options);

    if (response.data.places != null) {
      return true
    }
    return false
  } catch (error) {
    console.log(error)
    return false
  }
}

export const getActiveCount = (screenStatus) => {

  var activeCount = 0;

  for (const screen of screenStatus) {
    const d1 = new Date(screen.lastActive);
    const d2 = new Date();
    const diffTime = Math.abs(d2 - d1);
    const diffMins = Math.floor(diffTime / (1000 * 60));
    if (diffMins == 0)
      activeCount++;
  }

  return activeCount
};


export const updateRedisResponse = (input, currIndex , count , maxCount) => {
  var result = {}
  result["screenId"] = input.screenId;
  result[CAMPAIGN_STATUS_ACTIVE] = [];
  result[CAMPAIGN_STATUS_PAUSE] = [];
  result[CAMPAIGN_STATUS_HOLD] = input[CAMPAIGN_STATUS_HOLD];

  for ( const campaign of input[CAMPAIGN_STATUS_ACTIVE] ){
    var bt = [];
    for ( const index of campaign.atIndex ){
      for ( let i =0 ; i < count ; i++ ){
        var tempIndex = currIndex + i
        if ( tempIndex > maxCount )
          tempIndex -= maxCount
        if ( index == tempIndex ){
          bt.push(index) ;
        }
      }
    }
    if ( bt.length > 0 ){
      campaign.atIndex = bt
      result[CAMPAIGN_STATUS_ACTIVE].push(campaign);
    }
    else{
      result[CAMPAIGN_STATUS_PAUSE].push(campaign)
    }
  }

  return result
}