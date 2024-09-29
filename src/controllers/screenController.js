import { Audience } from "../models/audienceModel.js";
import {
  Screen,
} from "../models/screenModel.js";


export const getScreen = async (req, res) => {
  try {
    const { screenId } = req.query;
    const screen = await Screen.findById(screenId);
    if (!screen) return res.status(404).json({ message: "Screen not found" });
    res.status(200).json(screen);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllScreens = async (req, res) => {
  try {
    const { screenIds } = req.query;

    if (screenIds) {
      const screens = await Screen.find({
        _id: {
          $in: screenIds
        }
      });
      res.status(200).json(screens);
    } else {
      const screens = await Screen.find();
      res.status(200).json(screens);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getScreenAudienceData = async (req, res) => {
  try {
    const { screenIds } = req.body;

    // Fetch all screens if screenIds are not provided, otherwise fetch specific screens
    const screens = screenIds.length === 0
      ? await Screen.find()
      : await Screen.find({
          _id: {
            $in: screenIds
          }
        });

    if (!screens || screens.length === 0) return res.status(404).json({ message: "Screens not found" });

    // Map screen IDs to their audiences
    const audienceToScreens = screens.reduce((acc, screen) => {
      const audienceId = screen.dbAudiences[0]; // Assuming dbAudiences array is non-empty
      if (!acc[audienceId]) {
        acc[audienceId] = [];
      }
      acc[audienceId].push(screen.screenId);
      return acc;
    }, {});

    // Fetch audiences based on audience IDs
    const audiences = await Audience.find({
      _id: {
        $in: Object.keys(audienceToScreens)
      }
    });

    // Create a mapping of audience locations to audience data
    const audienceMap = audiences.reduce((acc, audience) => {
      if (!acc[audience.location]) {
        acc[audience.location] = [];
      }
      acc[audience.location].push(audience);
      return acc;
    }, {});

    let data = {};

    // Iterate over each screen
    screens.forEach((s) => {
      const screenMarket = s.market;
      const screenId = s.screenId;  // Use screenId as the key
      const touchpoints = s.location.touchPoints.length > 0 ? s.location.touchPoints : ["Unknown"];

      // Initialize data structure for each market if it doesn't exist
      if (!data[screenMarket]) {
        data[screenMarket] = {
          "gender": {
            "Male": { totalWeight: 0, count: 0 },
            "Female": { totalWeight: 0, count: 0 },
          },
          "audience": {},
          "touchpoint": {},
        };
      }

      // Iterate over each touchpoint
      touchpoints.forEach(touchpoint => {
        // Initialize the touchpoint structure if it doesn't exist
        if (!data[screenMarket].touchpoint[touchpoint]) {
          data[screenMarket].touchpoint[touchpoint] = {};
        }
        if (!data[screenMarket].touchpoint[touchpoint][screenId]) {
          data[screenMarket].touchpoint[touchpoint][screenId] = {};
        }

        const screenLocation = s.marketSite; // Assuming you want to match this with audience.location
        if (audienceMap[screenLocation]) {
          audienceMap[screenLocation].forEach((aud) => {
            s.audiences = aud.data; // Assign matching audiences

            aud.data.audience.forEach((entry) => {
              let maleWeightTotal = 0;
              let femaleWeightTotal = 0;
              let maleCount = 0;
              let femaleCount = 0;

              // Count male and female weights
              entry.gene.forEach((ge) => {
                if (ge.gender === "Male") {
                  maleWeightTotal += ge.weight;
                  maleCount++;
                } else if (ge.gender === "Female") {
                  femaleWeightTotal += ge.weight;
                  femaleCount++;
                }
              });

              // Assign to touchpoint structure
              if (!data[screenMarket].touchpoint[touchpoint][screenId][entry.type]) {
                data[screenMarket].touchpoint[touchpoint][screenId][entry.type] = {
                  "Male": { totalWeight: maleWeightTotal, count: maleCount },
                  "Female": { totalWeight: femaleWeightTotal, count: femaleCount },
                };
              } else {
                // If the audience type already exists, update the totals
                data[screenMarket].touchpoint[touchpoint][screenId][entry.type].Male.totalWeight += maleWeightTotal;
                data[screenMarket].touchpoint[touchpoint][screenId][entry.type].Male.count += maleCount;

                data[screenMarket].touchpoint[touchpoint][screenId][entry.type].Female.totalWeight += femaleWeightTotal;
                data[screenMarket].touchpoint[touchpoint][screenId][entry.type].Female.count += femaleCount;
              }

              // Aggregate gender data at the market level
              data[screenMarket].gender.Male.totalWeight += maleWeightTotal;
              data[screenMarket].gender.Male.count += maleCount;

              data[screenMarket].gender.Female.totalWeight += femaleWeightTotal;
              data[screenMarket].gender.Female.count += femaleCount;

              // Ensure audience type is added
              if (!data[screenMarket].audience[entry.type]) {
                data[screenMarket].audience[entry.type] = {
                  "Male": { totalWeight: maleWeightTotal, count: maleCount },
                  "Female": { totalWeight: femaleWeightTotal, count: femaleCount },
                };
              } else {
                data[screenMarket].audience[entry.type].Male.totalWeight += maleWeightTotal;
                data[screenMarket].audience[entry.type].Male.count += maleCount;

                data[screenMarket].audience[entry.type].Female.totalWeight += femaleWeightTotal;
                data[screenMarket].audience[entry.type].Female.count += femaleCount;
              }
            });
          });
        }
      });
    });

    // Compute averages for gender and audience types
    Object.keys(data).forEach(market => {
      const marketData = data[market];

      // Average for gender
      marketData.gender.Male = marketData.gender.Male.count > 0 ? (marketData.gender.Male.totalWeight / marketData.gender.Male.count).toFixed(2) : 0;
      marketData.gender.Female = marketData.gender.Female.count > 0 ? (marketData.gender.Female.totalWeight / marketData.gender.Female.count).toFixed(2) : 0;

      // Average for audience types
      Object.keys(marketData.audience).forEach(audienceType => {
        const audienceData = marketData.audience[audienceType];

        audienceData.Male = audienceData.Male.count > 0 ? (audienceData.Male.totalWeight / audienceData.Male.count).toFixed(2) : 0;
        audienceData.Female = audienceData.Female.count > 0 ? (audienceData.Female.totalWeight / audienceData.Female.count).toFixed(2) : 0;
      });

      // Average for touchpoints
      Object.keys(marketData.touchpoint).forEach(touchpoint => {
        Object.keys(marketData.touchpoint[touchpoint]).forEach(screen => {
          const screenData = marketData.touchpoint[touchpoint][screen];

          Object.keys(screenData).forEach(audienceType => {
            const audienceData = screenData[audienceType];

            audienceData.Male = audienceData.Male.count > 0 ? (audienceData.Male.totalWeight / audienceData.Male.count).toFixed(2) : 0;
            audienceData.Female = audienceData.Female.count > 0 ? (audienceData.Female.totalWeight / audienceData.Female.count).toFixed(2) : 0;
          });
        });
      });
    });

    console.log(data);
    // Return updated screens as JSON
    res.status(200).json({ marketData: data, screens: screens, audienceIdsToScreenIds: audienceToScreens, audiences: audiences });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
