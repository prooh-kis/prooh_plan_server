// campaign trigger
const WEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5/";

// screen
const CRICBUZZ_API_BASE_URL = "https://cricbuzz-cricket.p.rapidapi.com/";
const GOOGLE_MAPS_API_BASE_URL = "https://places.googleapis.com/v1/";
const GOOGLE_MAPS_API_MAX_COUNT = 20;
const GOOGLE_MAPS_API_RADIUS = 200
const POI_LIST_ID = "poi_list_id"
const CAMPAIGN_COUNT = "campaign_count"
const SCREEN_COUNT = "screen_count"
const IMPRESSION_COUNT = "impression_count"

// redis
const MATCH_LIST = "match_list"
const AUDIENCE_TABLE_DATA = "audience_table_data"
const HOME_TABLE_DATA = "home_table_data"
const MAP_VIEW_DATA = "map_view_data"
const EXPIRATION_TIME_12 = 43200
const EXPIRATION_TIME_24 = 86400

// log report
const MAX_COUNT = 2000 

// sync screens
const PLAY_STATUS = "play"
const PAUSE_STATUS = "pause"

const DEFAULT_VIDEO = "DefaultVideo"
const SYNCED_STATUS = "SyncedStatus"

export {
    WEATHER_API_BASE_URL, CRICBUZZ_API_BASE_URL, GOOGLE_MAPS_API_BASE_URL, GOOGLE_MAPS_API_MAX_COUNT, GOOGLE_MAPS_API_RADIUS,
    POI_LIST_ID, MATCH_LIST, EXPIRATION_TIME_12, EXPIRATION_TIME_24, AUDIENCE_TABLE_DATA, HOME_TABLE_DATA, MAP_VIEW_DATA,
    CAMPAIGN_COUNT , SCREEN_COUNT , IMPRESSION_COUNT ,MAX_COUNT , PLAY_STATUS , PAUSE_STATUS , DEFAULT_VIDEO , SYNCED_STATUS
};
