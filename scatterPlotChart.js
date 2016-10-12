

function scatterPlotChart() {
  var margin = {top: 20, right: 80, bottom: 20, left: 20},
      width = 760,
      height = 120,
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },
      xFormat = d3.format(""),
      yFormat = d3.format(""),
      xScale = d3.scale.linear(),
      yScale = d3.scale.linear(),
      xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(6, 0),
      yAxis = d3.svg.axis().scale(yScale).orient("right"),
      area = d3.svg.area().x(X).y1(Y),
      line = d3.svg.line().x(X).y(Y);

  function chart(selection) {
    selection.each(function(data) {

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data = data.map(function(d, i) {
        var res = [xValue.call(data, d, i), yValue.call(data, d, i)];
        res.obj = d;
        return res;
      });

      // Update the x-scale.
      xScale
          .domain(d3.extent(data, function(d) { return d[0]; }))
          .range([0, width - margin.left - margin.right]);

      // Update the y-scale.
      yScale
          .domain([0, d3.max(data, function(d) { return d[1]; })]) // Start from 0
          // .domain(d3.extent(data, function(d) { return d[1]; }))
          .range([height - margin.top - margin.bottom, 0]);

      // Set the axis format
      xAxis.tickFormat(xFormat);
      yAxis.tickFormat(yFormat);

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g");

      gEnter.append("g").attr("class", "points");
      gEnter.append("g").attr("class", "x axis");
      gEnter.append("g").attr("class", "y axis");

      // Update the outer dimensions.
      svg .attr("width", width)
          .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Update the points.
      var points = g.select(".points")
        .selectAll(".point")
        .data(function (d) { return d; });

      points.enter()
        .append("circle")
        .attr("class", "point")
        .append("title")
        .text(function (d) { return d.obj.title + " " + yFormat(d[1]); });

      points
        .attr("cx", function (d) { return X(d); })
        .attr("cy", function (d) { return Y(d); })
        .attr("r", 3)
        .on("click", function (d) {
          window.open(d.obj.link, "_blank");
        });

        // .attr("cx", function (d) { return X(d); })

      points
        .exit().remove();



      // Update the x-axis.
      g.select(".x.axis")
          .attr("transform", "translate(0," + yScale.range()[0] + ")")
          .call(xAxis);

      // Update the x-axis.
      g.select(".y.axis")
          .attr("transform", "translate(" + xScale.range()[1] + ", 0)")
          .call(yAxis);

    });
  }

  // The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(d[0]);
  }

  // The x-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(d[1]);
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  chart.yFormat = function(_) {
    if (!arguments.length) return yFormat;
    yFormat = _;
    return chart;
  };

  chart.xFormat = function(_) {
    if (!arguments.length) return xFormat;
    xFormat = _;
    return chart;
  };

  return chart;
}

