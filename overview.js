window.onload = function () {
  var chart = new CanvasJS.Chart("chartContainer",
  {
    zoomEnabled: true,
    title:{
    text: "qPCR Overview Chart"  
    },
    data: overviewData()
  });

  chart.render();
}
