// Define variables
var demoInfo = d3.select("#sample-metadata");
var stateInfo = d3.select("#more-state-data");
var propInfo = d3.select("#property-state-data");
var stateHeading = d3.select("#sample-metadata-heading");

// Function to initialize page upon load
function init() {
    var url = "/api/statelist";
    d3.json(url).then(function (menuData) {
        console.log(menuData);

        // Prepare menu items for State dropdown
        for (var i = 0; i < menuData.length; i++) {
            d3.select("#selDataset")
                .append("option").text(menuData[i].State);
        }

        // Populate demographic info box with first ID
        var state = menuData[0].State;

        url = "/api/" + state + "/counties";
        d3.json(url).then(function (countyData) {
            console.log(countyData);
            // Prepare menu items for County dropdown
            d3.select("#selCountyDataset")
                .append("option").text("--Select--");

            for (var i = 0; i < countyData.length; i++) {
                d3.select("#selCountyDataset")
                    .append("option").text(countyData[i].County);
            }

            plotAndInfo(state);
            plotLineGraph(state);
            plotBubble(state);
        })
    });
};

function optionChanged(option) {
    // Delete previous trace if any
    deleteTrace("scatter-state");

    // Get the state abbreviation equivalent
    var url = "/api/statelist";

    d3.json(url).then(function (stateList) {
        console.log(stateList);
        abbrevDict = stateList.filter(d => d.State[0] === option);
        console.log(abbrevDict);
        state = abbrevDict[0].State;

        url = "/api/" + state + "/counties";
        d3.json(url).then(function (countyData) {
            console.log(countyData);
            // Empty county dropdown
            d3.select("#selCountyDataset").html("");
            // Prepare menu items for county dropdown
            d3.select("#selCountyDataset")
                .append("option").text("--Select--");

            for (var i = 0; i < countyData.length; i++) {
                d3.select("#selCountyDataset")
                    .append("option").text(countyData[i].County);
            }

            plotAndInfo(state);
            plotLineGraph(state);
            plotBubble(state);
        });
    });
};

// Plot scatterplot and insert new state info
function plotAndInfo(state) {
    url = "/api/v1/" + state;
    d3.json(url).then(function (plotData) {
        console.log(plotData);

        var x_values = [];
        var y_values = [];
        var county_names = [];

        for (var i = 0; i < plotData.length; i++) {
            x_values.push(plotData[i].Case_1000);
            y_values.push(plotData[i].Change);
            county_names.push(plotData[i].County);
        }

        // Build graph with first ID
        var data = [{
            x: x_values,
            y: y_values,
            mode: 'markers',
            type: 'scatter',
            name: 'Other',
            text: county_names,
            showlegend: false,
            marker: {
                size: 12,
                color: "royalblue",
                line: {
                    color: 'rgb(255,255,255)',
                    width: 1
                }
            },

            hovertemplate:
                "<b>%{text}</b><br><br>" +
                "%{yaxis.title.text}: %{y:.2%}<br>" + // CHECK!
                "%{xaxis.title.text}: %{x:.2f}<br>" +
                "<extra></extra>",
        }];

        var layout = {
            hovermode: "closest",
            hoverlabel: { bgcolor: "#FFF" },
            xaxis: {
                range: [d3.min(x_values) - 10, d3.max(x_values) + 10],
                title: "COVID cases per 1000",
                // showgrid:false,
                gridcolor: '#ffff',
                ticklen: 4

            },
            yaxis: {
                range: [d3.min(y_values) - 0.01, d3.max(y_values) + 0.05],
                tickformat: ".0%", // CHECK!
                title: "% change in property value",
                // showgrid: false,
                gridcolor: '#ffff',
                ticklen: 4
            },
            plot_bgcolor: 'rgba(240,240,240, 0.95)',
            title: `Property value vs COVID cases in ${state} (Jan-Sep 2020)`,
            autosize: false,
            width: 900,
            height: 500,
            margin: {
                l: 100,
                r: 50,
                b: 100,
                t: 100,
                pad: 10
            },
            legend: {
                x: 1,
                xanchor: 'right',
                y: 1,
                font: {
                    family: 'sans-serif',
                    size: 12,
                    color: '#000'
                },
                bgcolor: '#E2E2E2',
                bordercolor: '#FFFFFF',
                borderwidth: 1
            },
            font: {
                family: 'Arial, sans-serif'
            }
        };

        Plotly.newPlot('scatter-state', data, layout);

        url = "/api/v2/" + state;
        d3.json(url).then(function (stateData) {
            // Clear out previous data
            demoInfo.html("");
            stateHeading.html("");
            stateInfo.html("");
            propInfo.html("");

            // Get metadata for state info
            console.log(stateData);

            stateHeading.append().text(`${stateData[0].State} State Info:`);
            demoInfo.append().text(stateData[0].Cases);
            stateInfo.append().text(stateData[0].Deaths);
            propInfo.append().text((stateData[0].Change * 100).toFixed(2) + "%");

        })
    })
}

function plotLineGraph(state) {
    // PLOT LINE GRAPH BY STATE
    url = "/api/v3/" + state;
    d3.json(url).then(function (plotData) {
        console.log(plotData);

        var x_values = [];
        var y_values_cases = [];
        var y_values_deaths = [];
        var y_values_value = [];
        var average_housing = [];
        var mortgage_rate = [];

        for (var i = 0; i < plotData.length; i++) {
            x_values.push(plotData[i].Month); // month
            y_values_value.push(plotData[i].AvgMonthlyChange); // monthly change 
            y_values_cases.push(plotData[i].TotalCases); // covid cases
            y_values_deaths.push(plotData[i].TotalDeaths); // covid deaths
            average_housing.push(plotData[i].AvgHousing); // housing value
            mortgage_rate.push(plotData[i].MortgageRate); // mortgage rate
        }

        // Build bar graph with first ID
        // MORTGAGE RATE
        var trace0 = {
            x: x_values,
            y: mortgage_rate,
            type: 'lines+markers',
            name: 'Mortgage rate',
            yaxis: 'y1',
            line: {
                color: 'rgb(0,133,66)',
                width: 3,
                shape: 'spline',
                dash: '0px 1500px'
            },
            marker: {
                color: 'rgb(0,133,66)',
                size: 7,
            }
        }

        // HOUSING VALUE
        var trace1 = {
            x: x_values,
            y: y_values_value,
            type: 'lines+markers',
            name: 'Avg % monthly change in property value',
            yaxis: 'y1',
            line: {
                color: 'rgb(210,50,45)',
                width: 3,
                shape: 'spline',
                dash: '0px 1500px'
            },
            marker: {
                color: 'rgb(210, 50, 45)',
                size: 7,
            }
        };

        // COVID CASES
        var trace2 = {
            x: x_values,
            y: y_values_cases,
            fill: 'tozeroy',
            type: 'scatter',
            yaxis: 'y2',
            name: 'COVID cases'
        };

        // COVID DEATHS
        var trace3 = {
            x: x_values,
            y: y_values_deaths,
            fill: 'tonexty',
            type: 'scatter',
            yaxis: 'y2',
            name: 'COVID deaths'
        };

        var data = [trace3, trace2, trace1];

        var layout = {
            xaxis: {
                title: "Month",
                gridcolor: '#ffff',
            },
            yaxis: {
                title: "Avg monthly % change in property value",
                // tickformat: ".0%", CHECK! just to add a %
                pad: 30,
                zeroline: true,
                showgrid: false,
                ticklen: 4
            },
            yaxis2: {
                title: 'Cumulative COVID cases/death',
                titlefont: { color: 'rgb(148, 103, 189)' },
                tickfont: { color: 'rgb(148, 103, 189)' },
                overlaying: 'y',
                side: 'right',
                pad: 30,
                showgrid: false,
                zeroline: false,
            },
            plot_bgcolor: 'rgba(240,240,240, 0.95)',
            title: `Change in property value vs cumulative COVID cases & deaths in ${state} (Feb-Sep 2020)`,
            autosize: false,
            width: 900,
            height: 500,
            margin: {
                l: 100,
                r: 50,
                b: 100,
                t: 100,
                pad: 10
            },
            showlegend: true,
            legend: {
                orientation: 'h',
                yanchor: 'top',
                xanchor: 'center',
                y: 1.09,
                x: 0.5,
                font: {
                    family: 'sans-serif',
                    size: 12,
                    color: '#000'
                },
                bgcolor: '#E2E2E2',
                bordercolor: '#FFFFFF',
                borderwidth: 1
            },
            font: {
                family: 'Arial, sans-serif'
            }
        };
        Plotly.newPlot('line-state', data, layout).then(function () {
            return Plotly.animate('line-state',
                [{
                    data: [{ 'line.dash': '1500px 0px' },
                    { 'line.dash': '1500px 0px' },
                    { 'line.dash': '1500px 0px' },
                    { 'line.dash': '1500px 0px' }
                    ]
                }],
                {
                    frame: { duration: 2250 },
                    transition: { duration: 5000 }
                }

            );
        })
    })
}

function plotBubble(state) {
    // PLOT BUBBLE GRAPH BY STATE
    url = "/api/v4/" + state;
    d3.json(url).then(function (plotData) {
        console.log(plotData);

        var counties_array = [];
        var x_values = [];
        var y_values_cases = [];
        var y_values_deaths = [];
        var average_housing = [];
        var housing_value = [];

        for (var i = 0; i < plotData.length; i++) {
            counties_array.push(plotData[i].County); // county
            x_values.push(plotData[i].Month); // month
            y_values_cases.push(plotData[i].Cases1000); // covid cases per 1000
            y_values_deaths.push(plotData[i].Deaths1000); // covid deaths per 1000
            average_housing.push(plotData[i].MonthlyChange); // monthly change housing value
            housing_value.push(plotData[i].HousingValue); // raw housing value
        }
        
        var unique_counties = Array.from(new Set(counties_array));
        var unique_months = Array.from(new Set(x_values));

        // Create a lookup table to sort and regroup the columns of data,
        // first by month, then by county:
        var lookup = {};
        function getData(month, county) {
            var byMonth, trace;
            if (!(byMonth = lookup[month])) {
                ;
                byMonth = lookup[month] = {};
            }
            // If a container for this month + county doesn't exist yet,
            // then create one:
            if (!(trace = byMonth[county])) {
                trace = byMonth[county] = {
                    x: [],
                    y: [],
                    id: [],
                    text: [],
                    marker: { size: [] }
                };
            }
            return trace;
        }

        // Go through each row, get the right trace, and append the data:
        for (var i = 0; i < plotData.length; i++) {
            var datum = plotData[i];
            var trace = getData(datum.Month, datum.County);
            trace.text.push(datum.County);
            trace.id.push(datum.County);
            trace.x.push(datum.Cases1000);
            trace.y.push(datum.MonthlyChange);
            trace.marker.size.push(datum.HousingValue);
        }

        // Get the group names:

        // In this case, every month includes every county, so we
        // can just infer the counties from the *first* year:
        var firstYear = lookup[unique_months[0]];
        console.log(firstYear);
        // Create the main traces, one for each continent:
        var traces = [];
        for (i = 0; i < unique_counties.length; i++) {
            var data = firstYear[unique_counties[i]];
            // One small note. We're creating a single trace here, to which
            // the frames will pass data for the different years. It's
            // subtle, but to avoid data reference problems, we'll slice
            // the arrays to ensure we never write any new data into our
            // lookup table:
            traces.push({
                name: unique_counties[i],
                x: data.x.slice(),
                y: data.y.slice(),
                id: data.id.slice(),
                text: data.text.slice(),
                mode: 'markers',
                marker: {
                    size: data.marker.size.slice(),
                    sizemode: 'area',
                    sizeref: 500,
                    // color: "royalblue"
                }
            });
        }

        // Create a frame for each year. Frames are effectively just
        // traces, except they don't need to contain the *full* trace
        // definition (for example, appearance). The frames just need
        // the parts the traces that change (here, the data).
        var frames = [];
        for (i = 0; i < unique_months.length; i++) {
            frames.push({
                name: unique_months[i],
                data: unique_counties.map(function (county) {
                    return getData(unique_months[i], county);
                })
            })
        }

        // Now create slider steps, one for each frame. The slider
        // executes a plotly.js API command (here, Plotly.animate).
        // In this example, we'll animate to one of the named frames
        // created in the above loop.
        var sliderSteps = [];
        for (i = 0; i < unique_months.length; i++) {
            sliderSteps.push({
                method: 'animate',
                label: unique_months[i],
                args: [[unique_months[i]], {
                    mode: 'immediate',
                    transition: { duration: 300 },
                    frame: { duration: 300, redraw: false },
                }]
            });
        }

        var layout = {
            xaxis: {
                title: 'COVID cases per 1000',
                range: [0, Math.max(...y_values_cases)+4]
            },
            yaxis: {
                title: 'Monthly percent change in property value',
                range: [Math.min(...average_housing) - 0.5, Math.max(...average_housing) + 0.5]

            },
            hovermode: 'closest',
            // We'll use updatemenus (whose functionality includes menus as
            // well as buttons) to create a play button and a pause button.
            // The play button works by passing `null`, which indicates that
            // Plotly should animate all frames. The pause button works by
            // passing `[null]`, which indicates we'd like to interrupt any
            // currently running animations with a new list of frames. Here
            // The new list of frames is empty, so it halts the animation.
            updatemenus: [{
                x: 0,
                y: 0,
                yanchor: 'top',
                xanchor: 'left',
                showactive: false,
                direction: 'left',
                type: 'buttons',
                pad: { t: 87, r: 10 },
                buttons: [{
                    method: 'animate',
                    args: [null, {
                        mode: 'immediate',
                        fromcurrent: true,
                        transition: { duration: 300 },
                        frame: { duration: 500, redraw: false }
                    }],
                    label: 'Play'
                }, {
                    method: 'animate',
                    args: [[null], {
                        mode: 'immediate',
                        transition: { duration: 0 },
                        frame: { duration: 0, redraw: false }
                    }],
                    label: 'Pause'
                }]
            }],
            // Finally, add the slider and use `pad` to position it
            // nicely next to the buttons.
            sliders: [{
                pad: { l: 130, t: 55 },
                currentvalue: {
                    visible: true,
                    prefix: 'Month:',
                    xanchor: 'right',
                    font: { size: 20, color: '#666' }
                },
                steps: sliderSteps
            }]
        };

        // Create the plot:
        Plotly.newPlot('bubble-state', {
            data: traces,
            layout: layout,
            frames: frames,
        });
    });
}

function plotBubbleCounty(state, county) {
    // PLOT BUBBLE GRAPH BY STATE
    url = "/api/v4/" + state;
    d3.json(url).then(function (plotData) {
        console.log(plotData);

        var counties_array = [];
        var x_values = [];
        var y_values_cases = [];
        var y_values_deaths = [];
        var average_housing = [];
        var housing_value = [];

        for (var i = 0; i < plotData.length; i++) {
            counties_array.push(plotData[i].County); // county
            x_values.push(plotData[i].Month); // month
            y_values_cases.push(plotData[i].Cases1000); // covid cases per 1000
            y_values_deaths.push(plotData[i].Deaths1000); // covid deaths per 1000
            average_housing.push(plotData[i].MonthlyChange); // monthly change housing value
            housing_value.push(plotData[i].HousingValue); // raw housing value
        }
        
        var unique_counties = Array.from(new Set(counties_array));
        var unique_months = Array.from(new Set(x_values));

        // Create a lookup table to sort and regroup the columns of data,
        // first by month, then by county:
        var lookup = {};
        function getData(month, county) {
            var byMonth, trace;
            if (!(byMonth = lookup[month])) {
                ;
                byMonth = lookup[month] = {};
            }
            // If a container for this month + county doesn't exist yet,
            // then create one:
            if (!(trace = byMonth[county])) {
                trace = byMonth[county] = {
                    x: [],
                    y: [],
                    id: [],
                    text: [],
                    marker: { size: [] }
                };
            }
            return trace;
        }

        // Go through each row, get the right trace, and append the data:
        for (var i = 0; i < plotData.length; i++) {
            var datum = plotData[i];
            var trace = getData(datum.Month, datum.County);
            trace.text.push(datum.County);
            trace.id.push(datum.County);
            trace.x.push(datum.Cases1000);
            trace.y.push(datum.MonthlyChange);
            trace.marker.size.push(datum.HousingValue);
        }

        // Get the group names:

        // In this case, every month includes every county, so we
        // can just infer the counties from the *first* year:
        var firstYear = lookup[unique_months[0]];
        console.log(firstYear);
        // Create the main traces, one for each continent:
        var traces = [];
        var color;

        for (i = 0; i < unique_counties.length; i++) {
            var data = firstYear[unique_counties[i]];
            if (unique_counties[i] === county) {
                color = 'hsl(0,100,40)';
            }
            else {
                color = "royalblue";
            }
            // One small note. We're creating a single trace here, to which
            // the frames will pass data for the different years. It's
            // subtle, but to avoid data reference problems, we'll slice
            // the arrays to ensure we never write any new data into our
            // lookup table:

            traces.push({
                name: unique_counties[i],
                x: data.x.slice(),
                y: data.y.slice(),
                id: data.id.slice(),
                text: data.text.slice(),
                mode: 'markers',
                marker: {
                    size: data.marker.size.slice(),
                    sizemode: 'area',
                    sizeref: 500,
                    color: color
                }
            });
        }

        // Create a frame for each year. Frames are effectively just
        // traces, except they don't need to contain the *full* trace
        // definition (for example, appearance). The frames just need
        // the parts the traces that change (here, the data).
        var frames = [];
        for (i = 0; i < unique_months.length; i++) {
            frames.push({
                name: unique_months[i],
                data: unique_counties.map(function (county) {
                    return getData(unique_months[i], county);
                })
            })
        }

        // Now create slider steps, one for each frame. The slider
        // executes a plotly.js API command (here, Plotly.animate).
        // In this example, we'll animate to one of the named frames
        // created in the above loop.
        var sliderSteps = [];
        for (i = 0; i < unique_months.length; i++) {
            sliderSteps.push({
                method: 'animate',
                label: unique_months[i],
                args: [[unique_months[i]], {
                    mode: 'immediate',
                    transition: { duration: 300 },
                    frame: { duration: 300, redraw: false },
                }]
            });
        }

        var layout = {
            xaxis: {
                title: 'COVID cases per 1000',
                range: [0, Math.max(...y_values_cases)+0.5]
            },
            yaxis: {
                title: 'Monthly Percent Change in Property Value',
                range: [Math.min(...average_housing) - 0.5, Math.max(...average_housing) + 0.5]

            },
            hovermode: 'closest',
            // We'll use updatemenus (whose functionality includes menus as
            // well as buttons) to create a play button and a pause button.
            // The play button works by passing `null`, which indicates that
            // Plotly should animate all frames. The pause button works by
            // passing `[null]`, which indicates we'd like to interrupt any
            // currently running animations with a new list of frames. Here
            // The new list of frames is empty, so it halts the animation.
            updatemenus: [{
                x: 0,
                y: 0,
                yanchor: 'top',
                xanchor: 'left',
                showactive: false,
                direction: 'left',
                type: 'buttons',
                pad: { t: 87, r: 10 },
                buttons: [{
                    method: 'animate',
                    args: [null, {
                        mode: 'immediate',
                        fromcurrent: true,
                        transition: { duration: 300 },
                        frame: { duration: 500, redraw: false }
                    }],
                    label: 'Play'
                }, {
                    method: 'animate',
                    args: [[null], {
                        mode: 'immediate',
                        transition: { duration: 0 },
                        frame: { duration: 0, redraw: false }
                    }],
                    label: 'Pause'
                }]
            }],
            // Finally, add the slider and use `pad` to position it
            // nicely next to the buttons.
            sliders: [{
                pad: { l: 130, t: 55 },
                currentvalue: {
                    visible: true,
                    prefix: 'Month:',
                    xanchor: 'right',
                    font: { size: 20, color: '#666' }
                },
                steps: sliderSteps
            }]
        };

        // Create the plot:
        Plotly.newPlot('bubble-state', {
            data: traces,
            layout: layout,
            frames: frames,
        });
    });
}

function countyChanged(county) {
            // Delete previous trace from scatterplot if any
            deleteTrace("scatter-state");

            var state = d3.select("#selDataset").node().value;
            console.log(state);

            if (county === "--Select--") {
                // RESET LINE GRAPH TO GO BACK TO STATE
                plotLineGraph(state);
                plotBubble(state);
            }
            else {
                plotBubbleCounty(state, county);
                // SCATTERPLOT BY COUNTY
                // Retrieve data again for x and y data of specific county
                url = "/api/" + state + "/" + county;
                d3.json(url).then(function (plotData) {
                    console.log(plotData);
                    var x_values = [];
                    var y_values = [];
                    var county_names = [];

                    for (var i = 0; i < plotData.length; i++) {
                        x_values.push(plotData[i].Case_1000);
                        y_values.push(plotData[i].Change)
                        county_names.push(plotData[i].County)
                    }

                    // Add trace for county
                    Plotly.addTraces('scatter-state', {
                        x: x_values,
                        y: y_values,
                        name: county,
                        type: "scatter",
                        mode: "markers",
                        hoverinfo: "skip",
                        showlegend: true,
                        marker: {
                            size: 12,
                            color: "rgb(234, 153, 153)",
                            line: {
                                color: 'rgb(255,0,0)',
                                width: 2
                            }
                        },
                    })
                })

                // LINE GRAPH BY COUNTY
                url = "/api/v3/" + state + "/" + county;
                d3.json(url).then(function (plotData) {
                    console.log(plotData);

                    var x_values = [];
                    var y_values_cases = [];
                    var y_values_deaths = [];
                    var y_values_value = [];
                    var housing_value_county = [];
                    var mortgage_rate = [];

                    for (var i = 0; i < plotData.length; i++) {
                        x_values.push(plotData[i].Month);
                        y_values_cases.push(plotData[i].TotalCases);
                        y_values_deaths.push(plotData[i].TotalDeaths);
                        y_values_value.push(plotData[i].MonthlyChange);
                        housing_value_county.push(plotData[i].HousingValue);
                        mortgage_rate.push(plotData[i].MortgageRate);
                    }

                    // Build line graph with first ID

                    // MORTGAGE RATE
                    var trace0 = {
                        x: x_values,
                        y: mortgage_rate,
                        type: 'lines+markers',
                        name: 'Mortgage rate',
                        yaxis: 'y1',
                        line: {
                            color: 'rgb(0,133,66)',
                            width: 3,
                            shape: 'spline',
                            dash: '0px 1500px'
                        },
                        marker: {
                            color: 'rgb(0,133,66)',
                            size: 7,
                        }
                    }

                    // HOUSING VALUE
                    var trace1 = {
                        x: x_values,
                        y: y_values_value,
                        type: 'lines+markers',
                        name: '% change in property value',
                        yaxis: 'y1',
                        line: {
                            color: 'rgb(210,50,45)',
                            width: 3,
                            shape: 'spline',
                            dash: '0px 1500px'
                        },
                        marker: {
                            color: 'rgb(210, 50, 45)',
                            size: 7,
                        }
                    };

                    // COVID CASES
                    var trace2 = {
                        x: x_values,
                        y: y_values_cases,
                        fill: 'tozeroy',
                        type: 'scatter',
                        yaxis: 'y2',
                        name: 'COVID cases'
                    };

                    // COVID DEATHS
                    var trace3 = {
                        x: x_values,
                        y: y_values_deaths,
                        fill: 'tonexty',
                        type: 'scatter',
                        yaxis: 'y2',
                        name: 'COVID deaths'
                    };

                    var data = [trace3, trace2, trace1];

                    var layout = {
                        xaxis: {
                            // range: [d3.min(x_values) - 10, d3.max(x_values) + 10],
                            title: "Month",
                            gridcolor: '#ffff',
                            zeroline: false
                        },
                        yaxis: {
                            // range: [d3.min(y_values) - 0.01, d3.max(y_values) + 0.05],
                            title: "Monthly % property value change",
                            showgrid: false,
                            zeroline: true,
                            ticklen: 4,
                        },
                        yaxis2: {
                            title: 'Cumulative COVID cases/death',
                            titlefont: { color: 'rgb(148, 103, 189)' },
                            tickfont: { color: 'rgb(148, 103, 189)' },
                            overlaying: 'y',
                            side: 'right',
                            showgrid: false,
                            zeroline: false
                        },
                        plot_bgcolor: 'rgba(240,240,240, 0.95)',
                        title: `Change in property value vs cumulative COVID cases & deaths in ${county}, ${state} (Feb-Sep 2020)`,
                        autosize: false,
                        width: 900,
                        height: 500,
                        margin: {
                            l: 100,
                            r: 50,
                            b: 100,
                            t: 100,
                            pad: 10
                        },
                        showlegend: true,
                        legend: {
                            orientation: 'h',
                            yanchor: 'top',
                            xanchor: 'center',
                            y: 1.09,
                            x: 0.5,
                            font: {
                                family: 'sans-serif',
                                size: 12,
                                color: '#000'
                            },
                            bgcolor: '#E2E2E2',
                            bordercolor: '#FFFFFF',
                            borderwidth: 1
                        },
                        font: {
                            family: 'Arial, sans-serif'
                        }
                    };
                    Plotly.newPlot('line-state', data, layout).then(function () {
                        return Plotly.animate('line-state',
                            [{
                                data: [{ 'line.dash': '1500px 0px' },
                                { 'line.dash': '1500px 0px' },
                                { 'line.dash': '1500px 0px' },
                                ]
                            }],
                            {
                                frame: { duration: 2250 },
                                transition: { duration: 5000 }
                            }

                        );
                    });
                })
            }
        };

    // Delete trace with county info if exists
    function deleteTrace(divId) {
        try {
            Plotly.deleteTraces(divId, 1)
        } catch (error) {
            console.error(error);
        }
    };

init()