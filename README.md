# Property Values & COVID-19, Interest Rates
## Purpose
To examine the impact of COVID on property values within the nation and utilize machine learning to predict property value prices based on interest rates.

## Deployment
Website deployed on [Heroku](https://covid-housing.herokuapp.com/).
(Previous version also deployed on [Heroku](https://housing-covid.herokuapp.com/).)

## Data Sources
- Property value data from January to September 2020 from [Zillow](https://www.zillow.com/research/data/).
- Number of COVID cases and deaths at the state and county level from [New York Times](https://github.com/nytimes/covid-19-data).
- Census data to standardize COVID data per population from [Census.gov](https://www.census.gov/data.html).
- Mortgage rates data taken from [FreddieMac](http://www.freddiemac.com/pmms/pmms_archives.html).

## Visualizations
"Housing Analysis" page:
- Average monthly percent change in property value, cumulative COVID cases/deaths (Feb - Sept 2020) for a state or a particular county within the state
- Percent change in property value vs. COVID cases per 1000 people (Jan - Aug 2020) for a state by county
- Bubble chart of monthly percent change in property value vs. COVID cases per 1000 for each month from February to September 2020. Bubble size corresponds to the typical property value of the county, which is shown in the tooltip.

"Predictions" page:
- Historic average property values for a county in a state per year from 2013-2020
- Predicted property values at different interest rates for the following four years (2021-2024)

*/*A specific state/county can be selected from its respective dropdown menu.*

## Findings and Takeaways
- Overall, property values have increased across the nation from January to September 2020 alongside the increase in COVID cases. 
- Next steps: 
(1) A time-series analysis may reveal more telling trends about spikes in COVID cases and property values,
(2) Controlling for decreases in interest rates,
(3) A bivariate choropleth map for the entire United States to show COVID cases per 1000 and percent change in property values together. This is a sample bivariate choropleth map for New Jersey by county made in Tableau available on [Tableau Public](https://public.tableau.com/profile/alysma#!/vizhome/NJCOVIDvs_PropertyValueChange-BivariateChoroplethMap/Dashboard1).

More details can be found on the [documentation page on Heroku](https://housing-covid.herokuapp.com/documentation).
