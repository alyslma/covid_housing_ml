// var listNames = ["y_future_250", "y_future_300", "y_future_350", "y_future_400", "y_future_450", "y_future_500"];

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
            for (var i = 0; i < countyData.length; i++) {
                d3.select("#selCountyDataset")
                    .append("option").text(countyData[i].County);
            }

            var county = countyData[0].County;

            plotScatterCounty(state, county);
            plotMachineCounty(state, county);
        })
    });
};

// Plots scatterplot based on raw values
function plotScatterCounty(state, county) {
    // PLOT SCATTERPLOT BY COUNTY
    url = "/api/v5/" + state +"/"+ county;
    d3.json(url).then(function (plotData) {
        console.log(plotData);

        var counties_array = [];
        var housing_value = [];
        var ts_value = [];
        var interest_rates = [];

        for (var i = 0; i < plotData.length; i++) {
            counties_array.push(plotData[i].County); // county
            housing_value.push(plotData[i].HousingValue); // housing value
            ts_value.push(((plotData[i].TSValue)/12)+2013); // ts
            interest_rates.push(plotData[i].InterestRate); // interest rate
        }

        // Build graph with first ID
        var data = [{
            x: ts_value,
            y: housing_value,
            mode: 'markers',
            type: 'scatter',
            name: 'County',
            // text: county_names,
            showlegend: false,
            marker: {
                size: 13,
                color: interest_rates,
                colorscale: 'Viridis',
                colorbar: {
                    thickness: 30,
                    title:"Interest rates"
                }
            },
        }];

        var layout = {
            hovermode: "closest",
            hoverlabel: { bgcolor: "#FFF" },
            xaxis: {
                // range: [d3.min(x_values) - 10, d3.max(x_values) + 10],
                title: "Year",
                // showgrid:false,
                gridcolor: '#ffff',
                ticklen: 4

            },
            yaxis: {
                // range: [d3.min(y_values) - 0.01, d3.max(y_values) + 0.05],
                title: "Average property value",
                // showgrid: false,
                gridcolor: '#ffff',
                ticklen: 4
            },
            plot_bgcolor: 'rgba(240,240,240, 0.95)',
            title: `${county}, ${state} historic property values`,
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

        Plotly.newPlot('scatter-county', data, layout);
    })
}

// To plot predictions with machine learning model
function plotMachineCounty(state, county) {
    // SCIKIT BY COUNTY
    url = "/api/v6/" + state +"/"+ county;
    d3.json(url).then(function(plotData) {

        plotData = plotData[0];
        console.log(plotData);

        var mse = plotData.MSEValue.toFixed(3);
        var r2 = plotData.r2.toFixed(3);

        var x_values = [2021, 2022, 2023, 2024];
        var y_values_250_list = [];
        var y_values_300_list = [];
        var y_values_350_list = [];
        var y_values_400_list = [];
        var y_values_450_list = [];
        var y_values_500_list = [];
        
        for (var i = 0; i < 4; i++) {
            y_values_250_list.push(plotData.y_future_250[i][0]); // month
            y_values_300_list.push(plotData.y_future_300[i][0]); // monthly change 
            y_values_350_list.push(plotData.y_future_350[i][0]); // covid cases
            y_values_400_list.push(plotData.y_future_400[i][0]); // covid deaths
            y_values_450_list.push(plotData.y_future_450[i][0]); // housing value
            y_values_500_list.push(plotData.y_future_500[i][0]); // mortgage rate
        }

        // 250
        var trace0 = {
            x: x_values,
            y: y_values_250_list,
            type: 'scatter',
            name: '2.50%',
        }

        // 300
        var trace1 = {
            x: x_values,
            y: y_values_300_list,
            type: 'scatter',
            name: '3.00%',
        };

        // 350
        var trace2 = {
            x: x_values,
            y: y_values_350_list,
            type: 'scatter',
            name: '3.50%',
        };

        // 400
        var trace3 = {
            x: x_values,
            y: y_values_400_list,
            type: 'scatter',
            name: '4.00%',
        };
        
        // 450
        var trace4 = {
            x: x_values,
            y: y_values_450_list,
            type: 'scatter',
            name: '4.50%',
        };

        // 500
        var trace5 = {
            x: x_values,
            y: y_values_500_list,
            type: 'scatter',
            name: '5.00%',
        };

        var data = [trace0, trace1, trace2, trace3, trace4, trace5];

        var layout = {
            xaxis: {
                title: "Year",
                gridcolor: '#ffff',
                tickmode: 'linear'
            },
            yaxis: {
                title: "Predicted property value",
                // tickformat: ".0%", CHECK! just to add a %
                pad: 30,
                zeroline: true,
                showgrid: false,
                ticklen: 4
            },
            plot_bgcolor: 'rgba(240,240,240, 0.95)',
            title: `${county}, ${state} predicted property values at different interest rates`,
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

        Plotly.newPlot('machine-county', data, layout);

        // Empty text
        d3.select("#mseValue").html("");
        d3.select("#mseValue").html("");
        // Add text
        d3.select("#mseValue").text(mse);
        d3.select("#rSquared").text(r2);
    })
};

function optionChanged(option) {
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
            for (var i = 0; i < countyData.length; i++) {
                d3.select("#selCountyDataset")
                    .append("option").text(countyData[i].County);
            }
            county = countyData[0].County;

            plotScatterCounty(state, county);
            plotMachineCounty(state, county);
        });
    });
};

function countyChanged(county) {
    var state = d3.select("#selDataset").node().value;
    console.log(state);

    plotScatterCounty(state, county);
    plotMachineCounty(state, county);
}

init()