import Papa from 'papaparse';
import './App.css';
import { useEffect, useState } from 'react';
import gamineCsv from './data/gamine.csv'
import hookfishCsv from './data/hookfish.csv'
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Grid from "@material-ui/core/Grid";
import Divider from '@material-ui/core/Divider';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

// Columns
  // 0: "email"
  // 1: "firstName"
  // 2: "lastName"
  // 3: "startDate"
  // 4: "employmentType"
  // 5: "department"
  // 6: "level"
  // 7: "city"
  // 8: "country"
  // 9: "gender"
  // 10: "salary"
  // 11: "bonus"

// Ideally round numbers to 2 decimals
Highcharts.setOptions({
    lang: {
        thousandsSep: ','
    },
});

const App = ({
}) => {
  const [gamineLoading, setGamineLoading] = useState(true);
  const [hookfishLoading, setHookfishLoading] = useState(true);
  const loading = gamineLoading && hookfishLoading;
  
  const [gamineData, setGamineData] = useState([]);
  const [hookfishData, setHookfishData] = useState([]);

  const [employmentType, setEmploymentType] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [gender, setGender] = useState("");

  // Maybe add start date for ranges

  // Not including city, too many options to filter on
  // Could possibly add it as an overall filter for the page?

  const categories = ["employmentType", "department", "level", "gender"];
  const values = ["salary", "bonus","totalCompensation"];

  // Ideally these wouldn't be hardcorded and fetched from the data instead
  const employmentTypes = ["fullTime", "contractor"];
  const departments = ["Front of house","Management", "Kitchen", "Operations"]
  const levels = ["1","2","3","4","5"]
  const genders = ["Male","Female"]

  const categoryIndexMap = {
    employmentType: 4,
    department: 5,
    level: 6,
    gender: 9
  }

  const valueIndexMap = {
    salary: 10,
    bonus: 11
  }

  const categoryOptionsMap = {
    employmentType: employmentTypes,
    department: departments,
    level: levels,
    gender: genders
  }

  const nameMapping = {
    employmentType: "Employment Type",
    department: "Department",
    level: "Level",
    gender: "Gender",
    salary: "Salary",
    bonus: "Bonus",
    totalCompensation: "Total Compensation"
  }

  useEffect(() => {
    let gamineRecords = [];
    let hookfishRecords = [];
    // Read csv files
    Papa.parse(gamineCsv, {
      download: true,
      complete: function (input) {
           gamineRecords = input.data.splice(1);
           setGamineData(gamineRecords);
           setGamineLoading(false);
      }
    });

    Papa.parse(hookfishCsv, {
      download: true,
      complete: function (input) {
           hookfishRecords = input.data.splice(1);
           setHookfishData(hookfishRecords);
           setHookfishLoading(false);
      }
    });
  }, []) 


  // Just doing averages for now
  // Ideally would want to add options for min, max, median, etc.
  // Need to add logic for global filters
  const getData = (categoryType, valueType) => {
    let totalCompFlag = false;
    if (valueType === "totalCompensation") {
      totalCompFlag = true;
    }

    const categoryOptions = categoryOptionsMap[categoryType];
    const gamineSeries = [];
    const hookfishSeries = [];

    for (let i = 0; i < categoryOptions.length; i++) {
      const option = categoryOptions[i];

      let gamineSum = 0;
      let gamineTotal = 0;
      for (let i = 0; i < gamineData.length; i++) {
        if (gamineData[i][categoryIndexMap[categoryType]] === option) {
          if (totalCompFlag) {
            gamineSum += Number(gamineData[i][valueIndexMap["salary"]]);
            gamineSum += Number(gamineData[i][valueIndexMap["bonus"]]);
          }
          else {
            gamineSum += Number(gamineData[i][valueIndexMap[valueType]]);
          }
          gamineTotal = gamineTotal + 1;
        }
      }
      gamineSeries.push(gamineSum/gamineTotal);

      let hookfishSum = 0;
      let hookfishTotal = 0;
      for (let i = 0; i < hookfishData.length; i++) {
        if (hookfishData[i][categoryIndexMap[categoryType]] === option) {
          if (totalCompFlag) {
            hookfishSum += Number(hookfishData[i][valueIndexMap["salary"]]);
            hookfishSum += Number(hookfishData[i][valueIndexMap["bonus"]]);
          }
          else {
            hookfishSum += Number(hookfishData[i][valueIndexMap[valueType]]);
          }
          hookfishTotal = gamineTotal + 1;
        }
      }
      hookfishSeries.push(hookfishSum/hookfishTotal);
    }

    return [{
      name: 'Gamine',
      data: gamineSeries

  }, {
      name: 'Hookfish',
      data: hookfishSeries

  }]
  }

  const options = (categoryType, valueType) => {
    return {
      chart: {
          type: 'column'
      },
        title: {
          text: `Average ${nameMapping[valueType]} by ${nameMapping[categoryType]}`
        },
        credits: {
          enabled: false
        },
        xAxis: {
          categories: categoryOptionsMap[categoryType],
          crosshair: true
        },
        yAxis: {
          title: {
            text: nameMapping[valueType]
          },
        },
        series: getData(categoryType,valueType)
      }
  };

  // Adding percent differences to charts would be useful 
  return (
    <div className="App">
      <h1>Compensation Comparison</h1>
      {loading && <h2>Loading...</h2>}
      {!loading &&
      <div>
        <Divider></Divider>
        <h2>Filters</h2>
        <p>These filters will be applied to all charts.</p>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <InputLabel>Employment Type</InputLabel>
            <Select
              value={employmentType}
              label="Employment Type"
              onChange={(event) => setEmploymentType(event.target.value)}
            >
              {employmentTypes.map(employmentType => (
                <MenuItem key={employmentType} value={employmentType}>{employmentType}</MenuItem>
              ))}
            </Select>          
          </Grid>
          <Grid item xs={3}>
            <InputLabel>Department</InputLabel>
            <Select
              value={department}
              label="Department"
              onChange={(event) => setDepartment(event.target.value)}
            >
              {departments.map(department => (
                <MenuItem key={department} value={department}>{department}</MenuItem>
              ))}
            </Select>          
          </Grid>
          <Grid item xs={3}>
            <InputLabel>Level</InputLabel>
            <Select
              value={level}
              label="Level"
              onChange={(event) => setLevel(event.target.value)}
            >
              {levels.map(level => (
                <MenuItem key={level} value={level}>{level}</MenuItem>
              ))}
            </Select>          
          </Grid>
          <Grid item xs={3}>
            <InputLabel>Gender</InputLabel>
            <Select
              value={gender}
              label="Gender"
              onChange={(event) => setGender(event.target.value)}
            >
              {genders.map(gender => (
                <MenuItem key={gender} value={gender}>{gender}</MenuItem>
              ))}
            </Select>          
          </Grid>
        </Grid>

        <Divider></Divider>
        <h2>By Employment Type</h2>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <HighchartsReact highcharts={Highcharts} options={options("employmentType","totalCompensation")} />
          </Grid>
          <Grid item xs={4}>
            <HighchartsReact highcharts={Highcharts} options={options("employmentType","salary")} />
          </Grid>
          <Grid item xs={4}>
            <HighchartsReact highcharts={Highcharts} options={options("employmentType","bonus")} />
          </Grid>
        </Grid>
        <Divider></Divider>

        <h2>By Department</h2>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <HighchartsReact highcharts={Highcharts} options={options("department","totalCompensation")} />
          </Grid>
          <Grid item xs={4}>
            <HighchartsReact highcharts={Highcharts} options={options("department","salary")} />
          </Grid>
          <Grid item xs={4}>
            <HighchartsReact highcharts={Highcharts} options={options("department","bonus")} />
          </Grid>
        </Grid>
        <Divider></Divider>

        <h2>By Level</h2>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <HighchartsReact highcharts={Highcharts} options={options("level","totalCompensation")} />
          </Grid>
          <Grid item xs={4}>
            <HighchartsReact highcharts={Highcharts} options={options("level","salary")} />
          </Grid>
          <Grid item xs={4}>
            <HighchartsReact highcharts={Highcharts} options={options("level","bonus")} />
          </Grid>
        </Grid>
        <Divider></Divider>

        <h2>By Gender</h2>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <HighchartsReact highcharts={Highcharts} options={options("gender","totalCompensation")} />
          </Grid>
          <Grid item xs={4}>
            <HighchartsReact highcharts={Highcharts} options={options("gender","salary")} />
          </Grid>
          <Grid item xs={4}>
            <HighchartsReact highcharts={Highcharts} options={options("gender","bonus")} />
          </Grid>
        </Grid>
      </div>
      }
    </div>
  )
}
export default App;
