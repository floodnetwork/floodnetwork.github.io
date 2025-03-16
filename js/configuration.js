// Change the data below as needed for your Flood Forum

const flood_forum_longname = "South Oxford FLood Action Group";
const flood_forum_shortname = "SOFLAG";
const navbar_colour = "#116F6C"; // This is the hex colour code for the navigation bar at the top of the page

// Define the list of EA flood warning and alert areas that you want on the dashboard. You need the relevant code ID and your description (which can be the EA description)
// To find your area code, you can use the PVFF National Map https://www.floodalleviation.uk/map/gb/ - turn on the EA: Flood Alert Areas and EA: Flood Warning Areas layers
// Click the areas you want and get the codes
const floodAreaIDs = [
    { id: "061WAF23Oxford", description: "River Thames and tributaries in the Oxford area" },
    { id: "061WAF14LChrwell", description: "River Cherwell from Lower Heyford down to and including Oxford" },
    { id: "061WAF23BsctKngs", description: "River Thames and tributaries from Buscot Wick down to Kings Lock" },
];

// Define the list of EA gauges to use on the 'Speedometer' part of the dashboard
// These should be river level or groundwater level gauges only. Not rainfall or volumetric flow.
//
// You can either use gauges (and their links) from https://environment.data.gov.uk/hydrology/explore or from https://check-for-flooding.service.gov.uk/
// For gauges on https://environment.data.gov.uk/hydrology/explore
// 1. Find your gauge on the map
// 2. Click "Download as CSV"
// 3. Get the URL link behind the relevant Download button (it might be "https://environment.data.gov.uk/hydrology/id/measures/e7b37054-c060-4ba6-b550-04d0d39c3557-level-i-900-m-qualified/readings.csv?_limit=2000000&mineq-date=2024-01-16&maxeq-date=2024-02-13")
// 4. Use the part of the URL up to and including /readings.csv
//
// For gauges on https://check-for-flooding.service.gov.uk/
// 1. Find your gauge on the map https://check-for-flooding.service.gov.uk/?v=map-live
// 2. Copy the URL. It should be like this "https://check-for-flooding.service.gov.uk/station/2188"
//
// For each gauge, define the Label. If it is Groundwater, put (GW) in the Label text.
// The text up to the first space in the Label is shown in the gauge
// Gauges that do not have (GW) in the Label are shown in cm
//
// For each define the min and max values for the gauge (you might want to examine historic levels)
// Also define when the Orange and Red starts on the gauge. On gauges on https://check-for-flooding.service.gov.uk/, the orange should the level that it says "Low lying land flooding possible"
// Red starts at the level when it says "Property flooding is possible above this level"
//
// Don't have more than 6 gauges

const gauge_details = [
	{ Label: "Hinksey Lake",
      url: 'https://check-for-flooding.service.gov.uk/station-csv/9120',
	  min: 74, startOrange: 160, startRed: 200, max: 300},
	
	{ Label: "Cold Harbour",
      url: 'https://check-for-flooding.service.gov.uk/station-csv/7076',
	  min: 74, startOrange: 160, startRed: 200, max: 300},
	  
    { Label: "Osney Rainfall",
      url: 'https://check-for-flooding.service.gov.uk/rainfall-station-csv/256230TP',
      min: 0, startOrange: 160, startRed: 165, max: 200},

];

// Define the list of EA gauges and their URLs for the 5 day chart
// These can include 1 rain gauge. For the rain gauge, make sure that the name contains the word 'rain'
// All other gauges should be river level only
// Find the gauge URLs in the same way as for the Speedometer gauges

const fiveday_river_station_details = [
    { name: 'Hinksey Lake',  url: 'https://check-for-flooding.service.gov.uk/station-csv/9120' },
	{ name: 'Hinksey Stream Coldharbour',  url: 'https://check-for-flooding.service.gov.uk/station-csv/7076' },

];

// Define the list of EA gauges and their URLs for the 5 month chart
// These should be river level only
// Find the gauge URLs in the same way as for the Speedometer gauges

const fivemonth_river_station_details = [

	{ name: 'Hinksey Stream Coldharbour',  url: 'https://environment.data.gov.uk/hydrology/id/measures/a65c175a-bae8-427a-822d-896ed2d53c58-level-i-900-m-qualified/readings.csv' },

];

// Define the list of EA gauges and their URLs for the groundwater chart
// These should be groundwater level only
// Find the gauge URLs in the same way as for the Speedometer gauges

const groundwater_station_details = [
    { name: 'Oxford (GW)',
      url: 'https://environment.data.gov.uk/hydrology/id/measures/ca3d0164-ee1d-444e-bc6c-04d600498b61-gw-logged-i-subdaily-mAOD-qualified/readings.csv' },

];
