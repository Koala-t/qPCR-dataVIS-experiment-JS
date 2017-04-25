// get all of the cycle data for a well
var selectWell = function(wellName){
  return data[wellName];
};


// find the cycle where the Linear Phase starts
var findLinearPhaseStart = function(wellName){
  var wellData = selectWell(wellName);
  var firstCycleChange = wellData[1].fluorescence - wellData[0].fluorescence;
  var secondCycleChange = wellData[2].fluorescence - wellData[1].fluorescence;

  var previousCycleChange = firstCycleChange;
  var linearPhaseStartCycle = 0;
  // iterate through the cycles
  for(var i = 1; i < wellData.length; i++){
    var currentCycleChange = wellData[i].fluorescence - wellData[i - 1].fluorescence
    
    if(currentCycleChange > previousCycleChange){
      // this is not i+1 because I want the cycle before the last time this statement is true
      linearPhaseStartCycle = i;
    } else if(currentCycleChange < previousCycleChange){
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

    if(currentCycleChange < previousCycleChange){
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

// print out the change in fluorescence per cycle during the linear phase
var linearPhaseSlope = function(wellName){
  var wellData = selectWell(wellName);
  var phaseStart = findLinearPhaseStart(wellName);
  var phaseEnd = findLinearPhaseEnd(wellName);
  var phaseDuration = phaseEnd - phaseStart;
  var phaseSlope = (wellData[phaseEnd].fluorescence - wellData[phaseStart].fluorescence) / phaseDuration
  
  return phaseSlope + " unit increase in fluorescence per cycle"
}


//formatt the data for use in the overview chart
var overviewData = function(){
  var reformattedData = [];

  for(var well in data){
    var dataPoints = [];
    data[well].forEach(function(cycle){
      dataPoints.push({x: cycle.cycle, y: cycle.fluorescence});
    });
    reformattedData.push({
      type: "line", 
      toolTipContent: "{well}  cycle: {x}, fluorescence: {y}",
      dataPoints: dataPoints
    });
  }

  return reformattedData;
}


// generate the overview table with jquery
$('#overviewTable').append('<th>Well</th>');

for(var i = 1; i <= 40; i++){
  $('#overviewTable').append('<th>cycle: ' + i + '</th>');
}

for(var well in data){
  $('#overviewTable').append('<tr id=' + well + '></tr>');
  $(document.getElementById(well)).append('<td>' + well + '</td>');
  data[well].forEach(function(cycle){
    $(document.getElementById(well)).append('<td>' + cycle.fluorescence + '</td>')
  });
}








// var table = d3.select('body').append('table');

// for(var well in data){

//   var tr = table.selectAll('tr')
//       .data(data[well]).enter()
//       .append('tr');

//   tr.append('th')
//       .attr('class', 'cycle')
//       .html(function(m) { return "cycle: " + m.cycle; }); 

   
//   tr.append('td')
//       .attr('class', 'fluorescence')
//       .html(function(m) { return m.fluorescence; });
 
// }
