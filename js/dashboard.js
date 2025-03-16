/* Copyright (C) Piers Allison - All Rights Reserved.
 * This code has been made available for use by the not for profit flood forums.
 *
 * This code makes use of techniques and code snippets that are widely
 * available in the public and open source domain.
 *
 * This code makes use of open data provided by the Environment Agency,
 *
 * You may use, distribute and modify this code for not-for-profit
 * purposes only.
 */

// Generic functions
const raincolour = "#00aeef";    

// Load the Google Charts library and line chart package
google.charts.load('current', {packages: ['corechart', 'gauge', 'bar']});
google.charts.setOnLoadCallback(loadCharts);

// Declare the stationData variable globally
let fiveday_river_stationData = [];
let fivemonth_river_stationData = [];
let groundwater_stationData = [];

function loadCharts()
{
	if (
	    document.getElementById("gauge1")
	    && typeof init_gauges === "function"
	    && Array.isArray(gauge_details)
	    && fiveday_river_station_details.length > 0
	) {
        init_gauges();
	}
	if (
	    document.getElementById("fiveday_river_chart_div")
	    && typeof init_fiveday_river_Chart === "function"
	    && Array.isArray(fiveday_river_station_details)
	    && fiveday_river_station_details.length > 0
	) {
	    init_fiveday_river_Chart();
	}
	
	if (
	    document.getElementById("fivemonth_river_chart_div")
	    && typeof init_fivemonth_river_Chart === "function"
	    && Array.isArray(fiveday_river_station_details)
	    && fiveday_river_station_details.length > 0
	) {
	    init_fivemonth_river_Chart();
	}

	if (
	    document.getElementById("groundwater_chart_div")
	    && typeof init_groundwater_Chart === "function"
	    && Array.isArray(groundwater_station_details)
	    && groundwater_station_details.length > 0
	) {
        init_groundwater_Chart();
	}
}
  
$(window).resize(function ()
{
	fiveday_river_drawChart();
	fivemonth_river_drawChart();
	groundwater_drawChart();
});

$(document).ready(function () {
	// Get the current date and time
	const nowDate = new Date();
	const currentDateTime = formatDateTime(nowDate);
	document.getElementById("currentDateTime").textContent = currentDateTime;
	
    updateHTMLwithparameters();
    
	//Toggle fullscreen
	$(".toggle-fullscreen").click(function (e) {
		e.preventDefault();
		
		var $this = $(this);
		var $row = $this.closest('.row');
		var $panel = $this.closest('.panel');
		var $col = $panel.parent();
		var $chart = $panel.find('.chart');
		
		if ($this.children('i').hasClass('glyphicon-resize-full'))
		{
// Hide other rows and columns
			$row.siblings().hide();
			$col.siblings().hide();
			$panel.find('.panel-footer').hide();
			$panel.find('.date_selector').show();

			$this.children('i').removeClass('glyphicon-resize-full');
			$this.children('i').addClass('glyphicon-resize-small');
		}
		else if ($this.children('i').hasClass('glyphicon-resize-small'))
		{
			$row.siblings().show();
			$col.siblings().show();
			$panel.find('.panel-footer').show();
			$panel.find('.date_selector').hide();

			$this.children('i').removeClass('glyphicon-resize-small');
			$this.children('i').addClass('glyphicon-resize-full');
			$('.modal').hide(); // closes all active pop ups.
			$('.modal-backdrop').remove(); // removes the grey overlay.		
		}

//		$panel.toggleClass('panel-fullscreen');
//		$panel.toggleClass('panel-default');
		$col.toggleClass('col-md-12');		
		$col.toggleClass('col-md-6');
		$col.toggleClass('col-lg-12');		
		$col.toggleClass('col-lg-4');
		$row.toggleClass('onlyrow');		
		$chart.toggleClass('chartfullheight');
		$chart.toggleClass('chartsmall');
		fiveday_river_drawChart();
		fivemonth_river_drawChart();
		groundwater_drawChart();
		
	});
});

// Function to update all spans with the specified ID
function updateHTMLwithparameters() {
    const elementsToUpdate = [
        { selector: '#flood_forum_shortname', text: flood_forum_shortname },
        { selector: '#flood_forum_longname', text: flood_forum_longname }
    ];

    elementsToUpdate.forEach(item => {
        const spans = document.querySelectorAll(item.selector);
        spans.forEach(span => {
            span.textContent = item.text; // or use innerHTML if needed
        });
    });

    document.title = flood_forum_longname; // Set the document title
    document.documentElement.style.setProperty('--color-primary-0', navbar_colour);
	// Insert the formatted date and time into the HTML
	
}

function formatDateTime(date) {
    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const dateFormatter = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short'
    });
    
    const timezoneFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZoneName: 'short'
    });
    
    const time = timeFormatter.format(date);
    const formattedDate = dateFormatter.format(date);
    const timezone = timezoneFormatter.format(date).split(' ')[1];  // Gets "BST" or "GMT"

    return `${time}, ${formattedDate} (${timezone})`;
}


// Flood warning and alert section
let warnings = Array(6).fill().map(() => ({ count: 0, impact_list: '' }));
let warning_summary = 5;

// Assuming 'floodAreaIDs' is the array of flood area IDs and descriptions
// Create a new impact list for severity level 5
warnings[5].impact_list = ""; // Initialize the impact list for severity level 5
// Define the warning_text array at the beginning
const warning_text = ["", "Severe Flood Warnings", "Flood Warnings", "Flood Alerts", "Warnings Ended", "All Clear"];

// Fetch flood data
fetch('https://environment.data.gov.uk/flood-monitoring/id/floods')
    .then(response => response.json())
    .then(data => {
        // Create a set for easy lookup of flood area IDs in the fetched data
        const floodAreaIDsInJSON = new Set(data.items.map(item => item.floodAreaID));
        
        // Loop through warning IDs and find matches in the JSON
        floodAreaIDs.forEach(area => {
            const floodAreaID = area.id;
            if (floodAreaIDsInJSON.has(floodAreaID)) {
                // If the area is found in the fetched data, add to the appropriate severity level
                const severityLevel = data.items.find(item => item.floodAreaID === floodAreaID)?.severityLevel || 5; // Default to 5 if not found
                warnings[severityLevel].count++;
                warnings[severityLevel].impact_list += `<li><a href="https://flood-warning-information.service.gov.uk/target-area/${floodAreaID}"><span>${area.description}</span></a></li>`;
                // Update the worst severity level
                if (severityLevel < warning_summary) {
                    warning_summary = severityLevel;
                }
            } else {
                // If the area is NOT found in the fetched data, it's considered All Clear
                warnings[5].count++;
                warnings[5].impact_list += `<li><a href="https://flood-warning-information.service.gov.uk/target-area/${floodAreaID}"><span>${area.description}</span></a></li>`;
            }
        });

        // Now generate the warning summary HTML after fetching the data
        generateWarningHTML();
    })
    .catch(error => {
        console.error('Error fetching the flood data:', error);
    });

// Function to generate the warning summary
function generateWarningHTML() {
    const container = document.getElementById('warning-container');

    // Summary box
    const summaryDiv = document.createElement('div');
    summaryDiv.className = `col-xs-6 col-sm-4`; // Remove the severity class from here

    // Determine severity class and background color based on warning_summary
    const severityClass = `severity severity-${warning_summary}`;
    const bgClass = warning_summary === 5 ? 'bg-success' : 'bg-danger';

    const summaryHTML = `
       <div class="${severityClass} ${bgClass}">
        <h3 class="heading-xlarge">
            <i class="glyphicon ${warning_summary === 5 ? 'glyphicon-ok text-success' : 'glyphicon-exclamation-sign text-danger'}"></i>
        </h3>
        <div class="details">
            <div class="title">
                <strong style="font-size: 135%">${warning_text[warning_summary]}</strong>
            </div>
        </div>
        </div>
    `;
    summaryDiv.innerHTML = summaryHTML;
    container.appendChild(summaryDiv);

    // Warnings for each severity level
    for (let i = 1; i <= 5; i++) {
        const warningDiv = document.createElement('div');
        warningDiv.className = "col-xs-6 col-sm-4";

        const count = warnings[i].count;
        let linkHTML;

        // Adjust the link for the All Clear (severity 5)
        if (i === 5) {
            linkHTML = `<a class="severity severity-${i}" data-toggle="modal" href="#sev${i}modal" title="Click for details on impacted areas">`;
        } else {
            linkHTML = count === 0 ?
                `<a class="severity severity-${i}">` :
                `<a class="severity severity-${i}" data-toggle="modal" href="#sev${i}modal" title="Click for list of impacted areas">`;
        }

        const displayCount = (i === 5) ? count : warnings[i].count;

        const warningHTML = `
            ${linkHTML}
                <h3 class="heading-xlarge">
                    <img alt="${warning_text[i]}" src="https://www.floodalleviation.uk/dashboard_css_js/icons/${warning_text[i].toLowerCase().replace(/ /g, '-')}-icon.svg">
                    ${displayCount}
                </h3>
                <div class="details">
                    <div class="title">${warning_text[i]}</div>
                    <div class="tagline">${getWarningTagline(i)}</div>
                </div>
            </a>
        `;

        warningDiv.innerHTML = warningHTML;
        container.appendChild(warningDiv);

        // Populate the modal for the current severity level
        const modalList = document.querySelector(`#sev${i}modal .modal-body ul`);
        if (warnings[i].impact_list) {
            modalList.innerHTML = warnings[i].impact_list;
        }
    }
}

// Function to get the tagline based on the warning type
function getWarningTagline(type) {
    switch (type) {
        case 1: return "Severe flooding - danger to life";
        case 2: return "Flooding is expected - immediate action required";
        case 3: return "Flooding is possible - be prepared";
        case 4: return "Warnings removed in the last 24 hours";
        case 5: return "No flood warnings and alerts";
        default: return "";
    }
}

// Speedometer gauges section
function init_gauges() {
    const gaugeDataArray = new Array(gauge_details.length).fill(null); // Array to store fetched data

    // Fetch latest readings for each gauge
    Promise.all(gauge_details.map((gauge, index) => {
        // Add ?latest parameter based on the URL type
        let fetchUrl = gauge.url;
        if (fetchUrl.includes("hydrology")) {
            fetchUrl += '?latest=latest';
        }

        return fetch(fetchUrl)
            .then(response => response.text())
            .then(data => {
                const rows = data.split('\n').slice(1); // Skip header row
                let latestValue = null;

                if (fetchUrl.includes("hydrology")) {
                    // Parse data in "hydrology" format
                    for (let i = rows.length - 1; i >= 0; i--) {
                        const row = rows[i].trim();
                        if (row) {
                            let latestRow = row.split(',');
                            latestRow = latestRow.map(item => item.replace(/"/g, '').trim());

                            if (latestRow.length > 3) {
                                latestValue = parseFloat(latestRow[3]);
                                if (!isNaN(latestValue)) {
                                    break;
                                }
                            }
                        }
                    }
                } else if (fetchUrl.includes("check-for-flooding")) {
                    // Parse data in "check-for-flooding" format
                    for (let i = rows.length - 1; i >= 0; i--) {
                        const row = rows[i].trim();
                        if (row) {
                            let latestRow = row.split(',');
                            latestRow = latestRow.map(item => item.replace(/"/g, '').trim());

                            if (latestRow.length > 1) {
                                latestValue = parseFloat(latestRow[1]); // Extracts "Height (m)" column
                                if (!isNaN(latestValue)) {
                                    break;
                                }
                            }
                        }
                    }
                }
                
                if (latestValue === null) {
                    console.error(`No valid value found for gauge ${gauge.Label}.`);
                } else {
                    latestValue = gauge.Label.includes("(GW)") 
                        ? Math.round(latestValue * 10) / 10 // Round to one decimal for GW values
                        : latestValue * 100; // Multiply for non-GW values
                }

                // Store the gauge data
                gaugeDataArray[index] = { index, label: gauge.Label, value: latestValue, min: gauge.min, max: gauge.max, startOrange: gauge.startOrange, startRed: gauge.startRed };
            })
            .catch(error => console.error(`Error fetching data for gauge ${gauge.Label}:`, error));
    }))
    .then(() => {
        // All fetch requests complete, now draw each gauge
        gaugeDataArray.forEach(gaugeData => {
            if (gaugeData) {
				var label = gaugeData.label;
				
				// Remove "(GW)" if it exists in the label
				label = label.replace("(GW)", "").trim();
				
				// Check if the resulting string is 12 characters or more
				var gaugefirstWord = label.length >= 12 ? label.split(' ')[0] : label;

                drawGauge(gaugeData.index, gaugefirstWord, gaugeData.value, gaugeData.min, gaugeData.max, gaugeData.startOrange, gaugeData.startRed);

                // Update the gauge title dynamically
//                const gaugeDiv = document.getElementById(`gauge${gaugeData.index + 1}`);
//                const titleElement = document.createElement('small');
//                titleElement.innerText = gaugeData.label;
//                gaugeDiv.parentElement.appendChild(titleElement);
            }
        });
    });
}
// Function to retrieve the minors and majors for a given range
function getTickSettings(range, min) {

// Define the range settings map as we discussed
const rangeSettings = {
    3: { minors: null, majors: [0, 0.5, 1, 1.5, 2, 2.5, 3] },
    4: { minors: null, majors: [0, 1, 2, 3, 4] },
    5: { minors: 0, majors: [0, 1, 2, 3, 4, 5] },
    6: { minors: 0, majors: [0, 1, 2, 3, 4, 5, 6] },
    7: { minors: 0, majors: [0, 1, 2, 3, 4, 5, 6, 7] },
    8: { minors: 2, majors: [0, 2, 4, 6, 8] },
    9: { minors: 0, majors: [0, 3, 6, 9] },
    10: { minors: 2, majors: [0, 2, 4, 6, 8, 10] },
    15: { minors: 5, majors: [0, 5, 10, 15] },
    20: { minors: 5, majors: [0, 5, 10, 15, 20] },
    25: { minors: 5, majors: [0, 5, 10, 15, 20, 25] },
    30: { minors: 0, majors: [0, 5, 10, 15, 20, 25, 30] },
    35: { minors: 0, majors: [0, 5, 10, 15, 20, 25, 30, 35] },
    40: { minors: 2, majors: [0, 10, 20, 30, 40] },
    45: { minors: 3, majors: [0, 15, 30, 45] },
    50: { minors: 2, majors: [0, 10, 20, 30, 40, 50] },
    55: { minors: 0, majors: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] },
    60: { minors: 2, majors: [0, 10, 20, 30, 40, 50, 60] },
    70: { minors: 2, majors: [0, 10, 20, 30, 40, 50, 60, 70] },
    80: { minors: 2, majors: [0, 20, 40, 60, 80] },
    90: { minors: 2, majors: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90] },
    100: { minors: 2, majors: [0, 20, 40, 60, 80, 100] },
    120: { minors: 2, majors: [0, 20, 40, 60, 80, 100, 120] },
    130: { minors: 0, majors: [0, , 20, , 40, , 60, , 80, , 100, , 120, 130] },
    140: { minors: 2, majors: [0, 20, 40, 60, 80, 100, 120, 140] },
    150: { minors: 3, majors: [0, 30, 60, 90, 120, 150] },
    160: { minors: 4, majors: [0, 40, 80, 120, 160] },
    180: { minors: 2, majors: [0, 20, 40, 60, 80, 100, 120, 140, 160, 180] },
    200: { minors: 2, majors: [0, 40, 80, 120, 160, 200] },
    220: { minors: null, majors: [0, 20, 40, 60, 80, 100, , 140, 160, 180, 200, 220] },
    240: { minors: 2, majors: [0, 40, 80, 120, 160, 200, 240] }
};

    if (rangeSettings[range]) {
        const settings = rangeSettings[range];
        return {
            minors: settings.minors,
			majors: settings.majors.map(value => String(value + min))  // Convert majors to strings by adding min
        };
    } else {
        // Fallback to blank settings if range not found
        return { minors: null, majors: null };
    }
}

// Modified drawGauge function
function drawGauge(index, label, value, min, max, startOrange, startRed) {
    const gaugeDivId = `gauge${index + 1}`;
    const gaugedata = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        [label, value]
    ]);

    const range = max - min;
    
    // Get the appropriate tick settings
    const tickSettings = getTickSettings(range, min);
    const majorTicks = tickSettings.majors; // Shift by min
    const minorTicks = tickSettings.minors;

    // Gauge options including majorTicks and minorTicks
    const options = {
		width: "100%", height: "100%",
        redFrom: startRed, redTo: max,
        yellowFrom: startOrange, yellowTo: startRed,
        max: max,
        min: min,
        majorTicks: majorTicks,
        minorTicks: minorTicks,
    };

    const gauge = new google.visualization.Gauge(document.getElementById(gaugeDivId));
    gauge.draw(gaugedata, options);
}

// Five day dashboard section
// Declare global variables
var fiveday_river_dataTable;

// Initialize the five-day river chart
function init_fiveday_river_Chart() {
    // Get the datetime 5 days ago
    const now = new Date();
    const fiveDaysAgo = new Date(now .setDate(now .getDate() - 5)).toISOString().split('T')[0];

    const fiveday_river_stations = fiveday_river_station_details.map(station => {
        const baseUrl = station.url;
        let url = `${baseUrl}?`;

        if (baseUrl.includes("hydrology")) {
	        url += `&mineq-date=${fiveDaysAgo}`;
		}

        return {
            name: station.name,
            url: url
        };
    });
    
    fiveday_river_stationData = new Array(fiveday_river_station_details.length).fill(null);

    // Load each station's data and populate the stationData array
    Promise.all(fiveday_river_stations.map((station, index) => 
        fetch(station.url)
            .then(response => response.text())
            .then(data => {
                const rows = data.split('\n').slice(1);
                let stationRows;

                // Check the URL type to parse data accordingly
                if (station.url.includes("hydrology")) {
                    // Parse data in "hydrology" format
                    stationRows = rows.map(row => {
                        const columns = row.split(',').map(item => item.replace(/"/g, '').trim());
                        if (columns.length > 3) {
                            return [columns[1], parseFloat(columns[3])];
                        }
                        return null;
                    }).filter(row => row && row[0] && !isNaN(row[1]));

                } else if (station.url.includes("check-for-flooding")) {
                    // Parse data in "check-for-flooding" format
                    stationRows = rows.map(row => {
                        const columns = row.split(',').map(item => item.replace(/"/g, '').trim());
                        if (columns.length > 1) {
                            return [columns[0].slice(0, 19), parseFloat(columns[1])];
                        }
                        return null;
                    }).filter(row => row && row[0] && !isNaN(row[1]));

                } else {
                    console.warn(`Unknown data format for station ${station.name}`);
                    return;
                }

                fiveday_river_stationData[index] = { name: station.name, data: stationRows };
            })
    )).then(() => {
        // Check if data is available and create the DataTable
        if (!fiveday_river_stationData || fiveday_river_stationData.length === 0) {
            console.warn('No five-day river station data available.');
            return;
        }

        // Draw the chart
        fiveday_river_drawChart();
    });
}

// Function to draw the chart
function fiveday_river_drawChart() {
	var rangeMax = 80;  // Initialize rangeMax globally as 100. This it the initial y axis maximum

    const fiveday_river_dataTable = new google.visualization.DataTable();

    fiveday_river_dataTable.addColumn('datetime', 'Timestamp');
    
    // Add a column for each station in the order defined in the stations array
    fiveday_river_stationData.forEach(station => {
        fiveday_river_dataTable.addColumn('number', station.name);
    });

	// Set the end date as the current date
	const endDate = new Date();
	endDate.setMinutes(Math.floor(endDate.getMinutes() / 15) * 15);
	endDate.setSeconds(0, 0); // Set seconds and milliseconds to 0

	const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 5); // 5 days ago


    // Generate the initial null series
    const initialNullSeries = generateNull15minSeries(startDate, endDate); // Using the function you already have

    // Combine data by timestamp using the dates from the initialNullSeries
    const datetimes = initialNullSeries.map(row => row[0]); // Use timestamps from the initial null series

	// Initialize fivemonth_river_combinedData with empty rows (just dates and nulls)
	const fiveday_river_combinedData = [];
	
	// Iterate through each date and corresponding station data
	datetimes.forEach(datetime => {
	    const row = [datetime]; // Add the date for this row (it's already in string format)
	    
	    // For each station, find the value for the given date
	    fiveday_river_stationData.forEach((station, index) => {
	        if (Array.isArray(station.data)) {
	            // Find the matching date using string comparison (no need for Date object yet)
	            const heightValue = station.data.find(stationRow => stationRow[0] === datetime); // Compare directly as strings

	            // If heightValue is found, update the corresponding row with the height value
	            if (heightValue) {
	                // Here, we assume station.name contains 'rain' for rain-related stations, and for others, we multiply by 100
	                const value = station.name.includes("rain") ? heightValue[1] : Math.round(heightValue[1] * 10000) / 100;
	                row.push(value); // Push the value to the row
	                // If it's a non-rain station, update rangeMax
	                if (!station.name.includes("rain")) {
	                    const nonRainValue = heightValue[1] * 100;
	                    if (nonRainValue > rangeMax) {
							rangeMax = Math.ceil(nonRainValue / 10) * 10; // Round up to the next multiple of 10
	                    }
	                }
	            } else {
	                row.push(null); // If no data found for this date, push null
	            }
	        }
	    });
	
	    // Convert the first column (date) to a Date object (row[0] is in 'yyyy-mm-dd' format)
	    row[0] = new Date(row[0]); // Convert the date string to a Date object
	
	    // Add the row to the combined data
	    fiveday_river_combinedData.push(row);
	});

    // Add combined data to the DataTable
    if (fiveday_river_combinedData.length > 0) {
        fiveday_river_dataTable.addRows(fiveday_river_combinedData);
    } else {
        console.error('No combined data to add to the table:', fiveday_river_combinedData);
    }

    // Format the date column
    const dateTimeFormatter = new google.visualization.DateFormat({pattern: 'MMM d, h:mm a'});
    dateTimeFormatter.format(fiveday_river_dataTable, 0);

    // Create a view of the data table (optional for customizations like filtering)
    var fiveday_river_view = new google.visualization.DataView(fiveday_river_dataTable);

    // Generate the series options based on station names
    const fiveday_river_series = fiveday_river_stationData.map(station => {
        if (station.name.includes("rain")) {
            return { targetAxisIndex: 1, color: raincolour, lineDashStyle: null, type: "bars" };
        } else {
            return { targetAxisIndex: 0 };
        }
    });

    const fiveday_river_options = {
        interpolateNulls: true,
        animation: { duration: 1000, easing: 'in' },
        width: "100%", height: "100%",
        chartArea: { left: 45, top: 10, right: 45, bottom: 60, width: "100%", height: "100%" },
        backgroundColor: { fill: "#ffffff" },
        lineWidth: 2,
        series: fiveday_river_series,
        explorer: { actions: ['dragToZoom', 'rightClickToReset'] },
        hAxis: {
            viewWindow: { min: null, max: null },
            titleTextStyle: { bold: false, color: "#222", italic: false, fontSize: 12 },
            textStyle: { color: "#222", fontSize: 10 },
            gridlines: { count: -1 },
            minorGridlines: { count: 1 },
            title: "Date & Time"
        },
        vAxes: {
            0: {
                titleTextStyle: { bold: false, color: "#222", italic: false, fontSize: 12 },
                textStyle: { color: "#222", fontSize: 10 },
                title: "Depth above base value (cm)",
                useFormatFromData: true,
                minorGridlines: { count: 1 },
                viewWindow: { min: 0, max: rangeMax },
                gridlines: { count: 10 },
            },
            1: {
                titleTextStyle: { bold: false, color: raincolour, italic: false, fontSize: 12 },
                textStyle: { color: raincolour, fontSize: 10 },
                title: "Rain (mm) in 15 mins",
                useFormatFromData: true,
                viewWindow: { min: 0, max: 3 },
                gridlines: { color: 'transparent' },
            },
        },
        legend: { position: "bottom", maxLines: 2 },
    };

    const fiveday_river_chart = new google.visualization.LineChart(document.getElementById('fiveday_river_chart_div'));
    fiveday_river_chart.draw(fiveday_river_view, fiveday_river_options);
}

// Five month dashboard section

// Initialize the five-month river chart
function init_fivemonth_river_Chart() {
    // Get the date 5 months ago in YYYY-MM-DD format
    const today = new Date();
	const fiveMonthsAgo = new Date(today.setMonth(today.getMonth() - 5)).toISOString().split('T')[0];

    const fivemonth_river_stations = fivemonth_river_station_details.map(station => {
        const baseUrl = station.url;
        let url = `${baseUrl}?`;

        url += `&mineq-date=${fiveMonthsAgo}&time=12:00:00`;

        return {
            name: station.name,
            url: url
        };
    });

    fivemonth_river_stationData = new Array(fivemonth_river_stations.length).fill(null);

    // Load each station's data and populate the stationData array
    Promise.all(fivemonth_river_stations.map((station, index) => 
        fetch(station.url)
            .then(response => response.text())
            .then(data => {
                const rows = data.split('\n').slice(1);
                const stationRows = rows.map(row => {
                    const columns = row.split(',').map(col => col.replace(/^"|"$/g, '').trim());
	                const date = columns[2];  // Convert date string to Date object
                    const value = parseFloat(columns[3]);
	                return [date, value];
                }).filter(row => row[0] && !isNaN(row[1]));

                fivemonth_river_stationData[index] = { name: station.name, data: stationRows };
            })
    )).then(() => {
        // Check if data is available and create the DataTable
        if (!fivemonth_river_stationData || fivemonth_river_stationData.length === 0) {
            console.warn('No five-month river station data available.');
            return;
        }

        // Draw the chart
        fivemonth_river_drawChart();
    });
}

// Function to draw the chart
function fivemonth_river_drawChart() {
	var rangeMax = 80;  // Initialize rangeMax globally as 100. This it the initial y axis maximum

    const fivemonth_river_dataTable = new google.visualization.DataTable();

    fivemonth_river_dataTable.addColumn('date', 'Date'); // Use 'date' instead of 'datetime'
    
    // Add a column for each station in the order defined in the stations array
    fivemonth_river_stationData.forEach(station => {
        fivemonth_river_dataTable.addColumn('number', station.name);
    });

	// Set the end date as the current date
	const endDate = new Date();
	const startDate = new Date(endDate);
	startDate.setMonth(startDate.getMonth() - 5); // 5 months ago

    // Generate the initial null series
    const initialNullSeries = generateNullDateSeries(startDate, endDate); // Using the function you already have

    // Combine data by timestamp using the dates from the initialNullSeries
    const dates = initialNullSeries.map(row => row[0]); // Use timestamps from the initial null series

	// Initialize fivemonth_river_combinedData with empty rows (just dates and nulls)
	const fivemonth_river_combinedData = [];
	
	// Iterate through each date and corresponding station data
	dates.forEach(date => {
	    const row = [date]; // Add the date for this row (it's already in string format)
	    
	    // For each station, find the value for the given date
	    fivemonth_river_stationData.forEach((station, index) => {
	        if (Array.isArray(station.data)) {
	            // Find the matching date using string comparison (no need for Date object yet)
	            const heightValue = station.data.find(stationRow => stationRow[0] === date); // Compare directly as strings
	            
	            // If heightValue is found, update the corresponding row with the height value
	            if (heightValue) {
	                // Here, we assume station.name contains 'rain' for rain-related stations, and for others, we multiply by 100
	                const value = station.name.includes("rain") ? heightValue[1] : Math.round(heightValue[1] * 10000) / 100;
	                row.push(value); // Push the value to the row
	
	                // If it's a non-rain station, update rangeMax
	                if (!station.name.includes("rain")) {
	                    const nonRainValue = heightValue[1] * 100;
	                    if (nonRainValue > rangeMax) {
							rangeMax = Math.ceil(nonRainValue / 10) * 10; // Round up to the next multiple of 10
	                    }
	                }
	            } else {
	                row.push(null); // If no data found for this date, push null
	            }
	        }
	    });
	
	    // Convert the first column (date) to a Date object (row[0] is in 'yyyy-mm-dd' format)
	    row[0] = new Date(row[0]); // Convert the date string to a Date object
	
	    // Add the row to the combined data
	    fivemonth_river_combinedData.push(row);
	});

    // Add combined data to the DataTable
    if (fivemonth_river_combinedData.length > 0) {
        fivemonth_river_dataTable.addRows(fivemonth_river_combinedData);
    } else {
        console.error('No combined data to add to the table:', fivemonth_river_combinedData);
    }

    // Format the date column
    const dateTimeFormatter = new google.visualization.DateFormat({ pattern: 'dd/MM/yyyy' });
    dateTimeFormatter.format(fivemonth_river_dataTable, 0);

    // Create a view of the data table (optional for customizations like filtering)
    var fivemonth_river_view = new google.visualization.DataView(fivemonth_river_dataTable);

    const fivemonth_river_options = {
        interpolateNulls: true,
        animation: { duration: 1000, easing: 'in' },
        width: "100%", height: "100%",
        chartArea: { left: 45, top: 10, right: 10, bottom: 60, width: "100%", height: "100%" },
        backgroundColor: { fill: "#ffffff" },
        lineWidth: 2,
        series: [
            { targetAxisIndex: 0 },
            { targetAxisIndex: 0 },
        ],
        explorer: { actions: ['dragToZoom', 'rightClickToReset'] },
        hAxis: {
            viewWindow: { min: null, max: null },
            titleTextStyle: { bold: false, color: "#222", italic: false, fontSize: 12 },
            textStyle: { color: "#222", fontSize: 10 },
            gridlines: { count: -1 },
            minorGridlines: { count: 1 },
            title: "Date"
        },
        vAxes: {
            0: {
                titleTextStyle: { bold: false, color: "#222", italic: false, fontSize: 12 },
                textStyle: { color: "#222", fontSize: 10 },
                title: "Depth above base value (cm)",
                useFormatFromData: true,
                minorGridlines: { count: 1 },
                viewWindow: { min: 0, max: rangeMax },
                gridlines: { count: 10 },
            },
            1: {
                titleTextStyle: { bold: false, color: raincolour, italic: false, fontSize: 12 },
                textStyle: { color: raincolour, fontSize: 10 },
                title: "Rain (mm) in 15 mins",
                useFormatFromData: true,
                viewWindow: { min: 0, max: 3 },
                gridlines: { color: 'transparent' },
            },
        },
        legend: { position: "bottom", maxLines: 2 },
    };

    const fivemonth_river_chart = new google.visualization.LineChart(document.getElementById('fivemonth_river_chart_div'));
    fivemonth_river_chart.draw(fivemonth_river_view, fivemonth_river_options);
}

// Groundwater dashboard section
function init_groundwater_Chart() {
    // Get the date four years ago in YYYY-MM-DD format
    const today = new Date();
	const fourYearsAgo = new Date(today.setFullYear(today.getFullYear() - 4)).toISOString().split('T')[0];
	
    // Add the dynamic parameters
    const groundwater_stations = groundwater_station_details.map(station => {
        const baseUrl = station.url;
        let url = `${baseUrl}?_sort=-dateTime`;

        // Only add the time parameter if the URL does not contain "Dipped"
        if (baseUrl.includes("dipped")) {
            url += `&mineq-date=${fourYearsAgo}`;
        } else {
            url += `&mineq-date=${fourYearsAgo}&time=09:00:00`;
        }

        return {
            name: station.name,
            url: url
        };
    });

    // Initialize an array to hold the data for each station
    groundwater_stationData = new Array(groundwater_stations.length).fill(null);

	Promise.all(groundwater_stations.map((station, index) => 
	    fetch(station.url)
	        .then(response => response.text())
	        .then(data => {
	            const rows = data.split('\n').slice(1);
	            const stationRows = rows.map(row => {
	                const columns = row.split(',').map(col => col.replace(/^"|"$/g, '').trim());
	                const date = columns[2];  // Convert date string to Date object
	                const value = parseFloat(columns[3]);
	                return [date, value];
	            }).filter(row => row[0] && !isNaN(row[1]));
	
	            groundwater_stationData[index] = { name: station.name, data: stationRows };
	        })
	)).then(() => {
        // Check if data is available and create the DataTable
        if (!groundwater_stationData || groundwater_stationData.length === 0) {
            console.warn('No groundwater station data available.');
            return;
        }

	    groundwater_drawChart();
	});
};
             
// Function to draw the chart
function groundwater_drawChart() {
    const groundwater_dataTable = new google.visualization.DataTable();

    groundwater_dataTable.addColumn('date', 'Date'); // Use 'date' instead of 'datetime'
    
    // Add a column for each station in the order defined in the stations array
    groundwater_stationData.forEach(station => {
        groundwater_dataTable.addColumn('number', station.name);
    });

	// Set the end date as the current date
	const endDate = new Date();
	const startDate = new Date(endDate);
    startDate.setFullYear(startDate.getFullYear() - 4); // Four years ago

    // Generate the initial null series
    const initialNullSeries = generateNullDateSeries(startDate, endDate); // Using the function you already have

    // Combine data by timestamp using the dates from the initialNullSeries
    const dates = initialNullSeries.map(row => row[0]); // Use timestamps from the initial null series

	// Initialize groundwater_combinedData with empty rows (just dates and nulls)
	const groundwater_combinedData = [];
	
	// Iterate through each date and corresponding station data
	dates.forEach(date => {
	    const row = [date]; // Add the date for this row (it's already in string format)
	    
	    // For each station, find the value for the given date
	    groundwater_stationData.forEach(station => {
	        if (Array.isArray(station.data)) {
	            // Find the matching date using string comparison (no need for Date object yet)
	            const heightValue = station.data.find(stationRow => stationRow[0] === date); // Compare directly as strings
	            
	            // If heightValue is found, update the corresponding row with the height value
	            if (heightValue) {
	                // Here, we assume station.name contains 'rain' for rain-related stations, and for others, we multiply by 100
	                row.push(heightValue[1]);
	            } else {
	                // If no data found for this date, push null
	                row.push(null);
	            }
	        }
	    });
	
	    // Convert the first column (date) to a Date object (row[0] is in 'yyyy-mm-dd' format)
	    row[0] = new Date(row[0]); // Convert the date string to a Date object
	
	    // Add the row to the combined data
	    groundwater_combinedData.push(row);
	});

    // Add combined data to the DataTable
    if (groundwater_combinedData.length > 0) {
        groundwater_dataTable.addRows(groundwater_combinedData);
    } else {
        console.error('No combined data to add to the table:', groundwater_combinedData);
    }

    // Format the date column
    const dateTimeFormatter = new google.visualization.DateFormat({ pattern: 'dd/MM/yyyy' });
    dateTimeFormatter.format(groundwater_dataTable, 0);

    // Create a view of the data table (optional for customizations like filtering)
    var groundwater_view = new google.visualization.DataView(groundwater_dataTable);

	var datemin = new Date(new Date() - (3 * 365 * 24 * 60 * 60 * 1000));

    const groundwater_options = {
        interpolateNulls: true,
        animation: { duration: 1000, easing: 'in' },
        width: "100%", height: "100%",
        chartArea: {left: 45, top: 10, right:10, bottom:60, width: "100%", height: "100%"},
        backgroundColor: { fill: "#ffffff" },
        lineWidth: 2,
        explorer: { actions: ['dragToZoom', 'rightClickToReset'] },
        hAxis: {
            viewWindow: { min: datemin, max: null },
            titleTextStyle: { bold: false, color: "#222", italic: false, fontSize: 12 },
            textStyle: { color: "#222", fontSize: 10 },
            gridlines: { count: -1 },
            minorGridlines: { count: 1 },
            title: "Date"
        },
        vAxes: {
            0: {
                titleTextStyle: { bold: false, color: "#222", italic: false, fontSize: 12 },
                textStyle: { color: "#222", fontSize: 10 },
                title: "Level AOD (m)",
                useFormatFromData: true,
                minorGridlines: { count: 1 },
                gridlines: { count: 10 },
//	            viewWindow: { min: 0, max: 100 },
            },
            1: {
                titleTextStyle: { bold: false, color: raincolour, italic: false, fontSize: 12 },
                textStyle: { color: raincolour, fontSize: 10 },
                title: "Rain (mm) in 15 mins",
                useFormatFromData: true,
                viewWindow: { min: 0, max: 3 },
                gridlines: { color: 'transparent' },
            },
        },
        legend: { position: "bottom", maxLines: 2 },
    };

    const groundwater_chart = new google.visualization.LineChart(document.getElementById('groundwater_chart_div'));
    groundwater_chart.draw(groundwater_view, groundwater_options);
};


// Function to generate the initial null series
function generateNullDateSeries(startDateTime, endDateTime) {
    const dateSeries = [];
    let currentDate = new Date(startDateTime);
    
    while (currentDate <= endDateTime) {
        // Convert to string format 'YYYY-MM-DD'
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Push the date string with a null value (representing no data for that date)
        dateSeries.push([dateStr, null]);

        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateSeries;
}


// Function to generate the initial null series with 15-minute intervals
function generateNull15minSeries(startDateTime, endDateTime) {
    const dateSeries = [];
    let currentDateTime = new Date(startDateTime);

    while (currentDateTime <= endDateTime) {
        // Format the date as "YYYY-MM-DDTHH:MM:SS"
        const dateStr = currentDateTime.toISOString().slice(0, 19); // Keeps up to seconds, removes milliseconds

        // Push as formatted date string with null value
        dateSeries.push([dateStr, null]);
        
        // Move to the next 15 minutes
        currentDateTime.setMinutes(currentDateTime.getMinutes() + 15);
    }

    return dateSeries;
}
