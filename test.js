// get all of the cycle data for a well
var selectWell = function(wellName){
  return data[wellName];
};


// find the cycle where the Linear Phase starts
var findLinearPhaseStart = function(wellName){
  var wellData = selectWell(wellName);
  var previousCycleChange = wellData[1].fluorescence - wellData[0].fluorescence;
  var linearPhaseStartCycle = 0;
  
  // iterate through the cycles starting on cycleTwo
  for(var i = 1; i < wellData.length; i++){
    var currentCycleChange = wellData[i].fluorescence - wellData[i - 1].fluorescence
    
    //update linearPhaseStartCycle to be the last cycle where there was in increase in delta fluorescence
    if(currentCycleChange > previousCycleChange){
      // this is not i+1 because I want the cycle before the last time this statement is true
      linearPhaseStartCycle = i;
      // the > 2 check handles a bug where fluorescences of 0, 0, 1, 1 would tag the 0-1 border as the linear phase
    } else if(currentCycleChange < previousCycleChange && wellData[i].fluorescence > 2){
      // when the delta fluorescence starts dropping, return the linearPhaseStartCycle
      return linearPhaseStartCycle;
    }
    // update the previousCycleChange
    previousCycleChange = currentCycleChange;
  };
  return linearPhaseStartCycle;
}

// find the cycle where the Linear Phase ends
var findLinearPhaseEnd = function(wellName){
  var wellData = selectWell(wellName);
  var previousCycleChange = wellData[1].fluorescence - wellData[0].fluorescence;;
  var linearPhaseStartCycle = 0;
  // iterate through the cycles
  for(var i = 1; i < wellData.length; i++){
    var currentCycleChange = wellData[i].fluorescence - wellData[i - 1].fluorescence
    //return the cycle where the slope starts decreasing for the first time
    if(currentCycleChange < previousCycleChange && wellData[i].fluorescence > 2){
      // this is not i+1 because I want the cycle before the last time this statement is true
      return i;
    }
    previousCycleChange = currentCycleChange; 
  };
}

// return an array of the cycles in the linear phase
var linearPhaseRange = function(wellName){
  var start = findLinearPhaseStart(wellName);
  var end = findLinearPhaseEnd(wellName);

  var range = []
  while(start <= end){
    range.push(start);
    start++;
  }

  return range;
}

// return the change in fluorescence per cycle during the linear phase
var linearPhaseSlope = function(wellName){
  var wellData = selectWell(wellName);
  var phaseStart = findLinearPhaseStart(wellName);
  var phaseEnd = findLinearPhaseEnd(wellName);
  var phaseDuration = phaseEnd - phaseStart;
  var phaseSlope = (wellData[phaseEnd].fluorescence - wellData[phaseStart].fluorescence) / phaseDuration
  
  return phaseSlope + " unit increase in fluorescence per cycle"
}


//formatt the data for use in the solo chart
var wellData = function(wellName){
  var dataPoints = [];

  data[wellName].forEach(function(cycle){
    dataPoints.push({x: cycle.cycle, y: cycle.fluorescence});
  });
  var result = {
    type: "line", 
    toolTipContent: "{well}  cycle: {x}, fluorescence: {y}",
    dataPoints: dataPoints
  };  

  return result;
}

//formatt the data for use in the overview chart
var overviewData = function(){
  var reformattedData = [];

  for(var well in data){
    reformattedData.push(wellData(well));
  }

  return reformattedData;
}


// generate the overview table with jquery
var addHeaders = function(){
  // add the well header
  $('#overviewTable').append('<th>Well</th>');

  // add the cycle headers
  for(var i = 1; i <= 40; i++){
    $('#overviewTable').append('<th>cycle: ' + i + '</th>');
  }
}

// this doesn't really need to be it's own function but it helps keep the code organised
  // I could also alter this to make smaller tables pretty easily
var populateTable = function(){
  var rowFirstDigit = '0';
  var rowSecondDigit = '|';
  // add the data
  for(var well in data){
    // add a header for each row
    // this will not work for datasets with differently formatted names
      // but it makes the table easier to use
    if(rowFirstDigit !== well[4] || rowSecondDigit !== well[5]){
      rowFirstDigit = well[4]
      rowSecondDigit = well[5]
      addHeaders();
    } 
    var linearRange = linearPhaseRange(well);
    $('#overviewTable').append('<tr id=' + well + '></tr>');
    // add the wellName value as a button linked to a chart-generating function
    $(document.getElementById(well))
      .append('<td><button id=' + well + ' onclick="drawIndividualChart(this)">' + well + '</button></td>');
    

    data[well].forEach(function(cycle){
      // if the cycle is in the linear range or at the min/max fluorescence value give it a special id
      if(linearRange.includes(cycle.cycle)){
        $(document.getElementById(well))
          .append('<td class=linearRange >' + cycle.fluorescence + '</td>')
      } else if(cycle.fluorescence >= 4999 || cycle.fluorescence === 0) {
        $(document.getElementById(well))
          .append('<td class=plateau >' + cycle.fluorescence + '</td>')
      } else {
        $(document.getElementById(well))
          .append('<td>' + cycle.fluorescence + '</td>')
      }
    });
  }
}

populateTable();

var drawIndividualChart = function(element){
  var wellName = element.id;

  var chart = new CanvasJS.Chart("soloChartContainer",
  {
    zoomEnabled: true,
    title:{
    text: "qPCR Solo Chart for " + wellName  
    },
    data: [wellData(wellName)]
  });

  chart.render();
}
