import os

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import pandas as pd

from flask import Flask, jsonify, render_template

os.chdir(os.path.dirname(os.path.abspath(__file__)))
#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///resources/ProjectThree.db", connect_args={'check_same_thread': False})

# Reflect an existing database into a new model
Base = automap_base()
# Reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the table
Covid = Base.classes.covid_month
Change = Base.classes.change
Property = Base.classes.property

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Flask Routes
#################################################
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/aboutus")
def aboutus():
    return render_template("AboutUs.html")

@app.route("/analytics")
def analytics():
    return render_template("Analytics.html")

@app.route("/documentation")
def documentation():
    return render_template("Documentation.html")

@app.route("/table")
def table():
    return render_template("Table.html")

@app.route("/predictions")
def machine():
    return render_template("MachineLearning.html")

# Plot percent change in property value vs. COVID cases per 1000 people
@app.route("/api/v1/<state>")
def state_plot(state):
    session = Session(engine)

    results = session.query(Change.state,
                            Change.county,
                            Change.case_1000, 
                            Change.change).\
        filter(Change.state == state).all()
    
    session.close()

    all_counties = []
    for state, county, case1000, houseChange in results:
        counties_dict = {}
        counties_dict["State"] = state
        counties_dict["County"] = county
        counties_dict["Case_1000"] = case1000
        counties_dict["Change"] = houseChange
        all_counties.append(counties_dict)

    return jsonify(all_counties)

# Populate state info box
@app.route("/api/v2/<state>")
def state_info(state):
    session = Session(engine)

    results = session.query(Change.state,
                            func.sum(Change.cases),
                            func.sum(Change.deaths),
                            func.avg(Change.change)
                            ).\
        filter(Change.state == state).\
        group_by(Change.state).all()

    session.close()

    state_info = []
    for state, caseSum, deathSum, houseChangeAvg in results:
        state_dict = {}
        state_dict["State"] = state
        state_dict["Cases"] = caseSum
        state_dict["Deaths"] = deathSum
        state_dict["Change"] = houseChangeAvg
        state_info.append(state_dict)

    return jsonify(state_info)

# Populate state dropdown
@app.route("/api/statelist")
def state_list():
    session = Session(engine)
    results = session.query(Change.state).\
        distinct().\
        order_by(Change.state.asc())
    session.close()

    states_abbrev = []
    for state in results:
        state_dict = {}
        state_dict["State"] = state
        states_abbrev.append(state_dict)

    return jsonify(states_abbrev)

# Populate county dropdown
@app.route("/api/<state>/counties")
def county_list(state):
    session = Session(engine)
    results = session.query(Change.county).\
        filter(Change.state == state).\
        distinct().\
        order_by(Change.county.asc())
    session.close()

    state_counties = []
    for county in results:
        counties_dict = {}
        counties_dict["County"] = county
        state_counties.append(counties_dict)

    return jsonify(state_counties)

# Retrieve specific county data for scatterplot 
@app.route("/api/<state>/<county>")
def county_plot(state, county):
    session = Session(engine)

    results = session.query(Change.state,
                            Change.county,
                            Change.case_1000, 
                            Change.change).\
        filter(Change.state == state).\
        filter(Change.county == county).all()
    
    session.close()

    county_info = []
    for state, county, case1000, houseChange in results:
        county_dict = {}
        county_dict["State"] = state
        county_dict["County"] = county
        county_dict["Case_1000"] = case1000
        county_dict["Change"] = houseChange
        county_info.append(county_dict)

    return jsonify(county_info)

# Plot line graph by state
@app.route("/api/v3/<state>")
def state_covid(state):
    session = Session(engine)

    results = session.query(Covid.month,
                            func.avg(Covid.mon_change),
                            func.avg(Covid.value),
                            func.sum(Covid.cases),
                            func.sum(Covid.deaths),
                            Covid.int_rate).\
        filter(Covid.state == state).\
        group_by(Covid.month).all()

    session.close()

    all_covid_state = []
    for month, avgMonChange, avgHousing, totalCases, totalDeaths, intRate in results:
        covid_state = {}
        covid_state["Month"] = month
        covid_state["AvgMonthlyChange"] = avgMonChange
        covid_state["AvgHousing"] = avgHousing
        covid_state["TotalCases"] = totalCases
        covid_state["TotalDeaths"] = totalDeaths
        covid_state["MortgageRate"] = intRate
        all_covid_state.append(covid_state)

    return jsonify(all_covid_state)

# Plot line graph by county in state
@app.route("/api/v3/<state>/<county>")
def county_covid(state, county):
    session = Session(engine)

    results = session.query(Covid.state,
                            Covid.county,
                            Covid.month,
                            Covid.cases,
                            Covid.deaths, 
                            Covid.mon_change,
                            Covid.value,
                            Covid.int_rate).\
        filter(Covid.state == state).\
        filter(Covid.county == county).all()
    
    session.close()

    all_covid_county = []
    for state, county, month, totalCases, totalDeaths, monChange, housingValue, intRate in results:
        covid_county = {}
        covid_county["State"] = state
        covid_county["County"] = county
        covid_county["Month"] = month
        covid_county["TotalCases"] = totalCases
        covid_county["TotalDeaths"] = totalDeaths
        covid_county["MonthlyChange"] = monChange
        covid_county["HousingValue"] = housingValue
        covid_county["MortgageRate"] = intRate
        all_covid_county.append(covid_county)

    return jsonify(all_covid_county)

# Plot bubble graph by county in state
@app.route("/api/v4/<state>")
def bubble_county(state):
    session = Session(engine)

    results = session.query(Covid.state,
                            Covid.county,
                            Covid.month,
                            Covid.case_1000,
                            Covid.deaths_1000, 
                            Covid.mon_change,
                            Covid.value).\
        filter(Covid.state == state).all()
    
    session.close()

    all_covid_county = []
    for state, county, month, cases1000, deaths1000, monChange, housingValue in results:
        covid_county = {}
        covid_county["State"] = state
        covid_county["County"] = county
        covid_county["Month"] = month
        covid_county["Cases1000"] = cases1000
        covid_county["Deaths1000"] = deaths1000
        covid_county["MonthlyChange"] = monChange
        covid_county["HousingValue"] = housingValue
        all_covid_county.append(covid_county)

    return jsonify(all_covid_county)

# Machine learning: Plot scatterplot by county in state
@app.route("/api/v5/<state>/<county>")
def scatter_county(state, county):
    session = Session(engine)
    
    results = session.query(Property.state,
                            Property.county,
                            Property.value,
                            Property.month,
                            Property.year,
                            Property.ts,
                            Property.int_rate).\
        filter(Property.state == state).\
        filter(Property.county == county).all()
    
    session.close()
    
    int_county = []
    for state, county, value, month, year, ts, int_rate in results:
        county_info = {}
        county_info["State"] = state
        county_info["County"] = county
        county_info["HousingValue"] = value
        county_info["Month"] = month
        county_info["Year"] = year
        county_info["TSValue"] = ts
        county_info["InterestRate"] = int_rate
        int_county.append(county_info)

    return jsonify(int_county)

# Machine learning: sklearn
@app.route("/api/v6/<state>/<county>")
def sklearn_county(state, county):
    session = Session(engine)
    
    results = session.query(Property.value,
                            Property.ts,
                            Property.int_rate).\
        filter(Property.state == state).\
        filter(Property.county == county).all()
    
    session.close()
    
    interest_rates = []
    ts_value = []
    housing_value = []

    for value, ts, int_rate in results:
        housing_value.append(value)
        ts_value.append(ts)
        interest_rates.append(int_rate)
    
    test_dict = {'int_rate': interest_rates, 'ts': ts_value, 'value': housing_value}

    state_df = pd.DataFrame(test_dict)
    # regression models
    X = state_df[["int_rate","ts"]]
    y = state_df["value"].values.reshape(-1, 1)

    model = LinearRegression()
    X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=23)
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    MSE = mean_squared_error(y_test, predictions)
    r2 = model.score(X_test,y_test)
    coeff = model.coef_[0]
    print(coeff)

    # predict four years at various interest rates
    start = max(ts_value)

    X_future_250 = [[2.50,start+12],[2.50,start+24],[2.50,start+36],[2.50,start+48]]
    X_future_300 = [[3.00,start+12],[3.00,start+24],[3.00,start+36],[3.00,start+48]]
    X_future_350 = [[3.50,start+12],[3.50,start+24],[3.50,start+36],[3.50,start+48]]
    X_future_400 = [[4.00,start+12],[4.00,start+24],[4.00,start+36],[4.00,start+48]]
    X_future_450 = [[4.50,start+12],[4.50,start+24],[4.50,start+36],[4.50,start+48]] 
    X_future_500 = [[5.00,start+12],[5.00,start+24],[5.00,start+36],[5.00,start+48]]

    y_future_250 = model.predict(X_future_250).tolist()
    y_future_300 = model.predict(X_future_300).tolist()
    y_future_350 = model.predict(X_future_350).tolist()
    y_future_400 = model.predict(X_future_400).tolist()
    y_future_450 = model.predict(X_future_450).tolist()
    y_future_500 = model.predict(X_future_500).tolist()

    # plot the predictions: y_future_... on the y-axis and the years 2021, 2022, 2023, 2024 on the x-axis
    giveMeY = [{'y_future_250':y_future_250,'y_future_300':y_future_300, 'y_future_350':y_future_350, 'y_future_400':y_future_400, 'y_future_450':y_future_450, 'y_future_500':y_future_500, 'r2':r2, 'MSEValue':MSE}]
    
    return jsonify(giveMeY)

if __name__ == '__main__':
    app.run(debug=True)