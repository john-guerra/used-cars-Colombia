

function multipleLinesChart() {
  var margin = {top: 20, right: 80, bottom: 20, left: 20},
      width = 760,
      height = 120,
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },
      xFormat = d3.format(""),
      yFormat = d3.format("$s"),
      xScale = d3.scale.linear(),
      yScale = d3.scale.linear(),
      xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(6, 0),
      yAxis = d3.svg.axis().scale(yScale).orient("right"),
      line = d3.svg.line().x(X).y(Y),
      voronoi = d3.geom.voronoi().x(X).y(Y),
      focus,
      alignLines = false; // align all lines?



  function chart(selection) {
    selection.each(function(data) {

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data.points = data.points.map(function(d, i) {
        return [xValue.call(data, d, i), yValue.call(data, d, i)];
      });

      voronoi.clipExtent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);






      function updateData() {
        // Set the axis format
        xAxis.tickFormat(xFormat);
        yAxis.tickFormat((alignLines) ? d3.format("%") : yFormat);


        // Update the x-scale.
        xScale
            // .domain(d3.extent(data.points, function(d) { return d[0]; }))
            .domain([0,40])
            .range([0, width - margin.left - margin.right]);

        // Update the y-scale.
        yScale
            // .domain([0, d3.max(data.points, function(d) { return d[1]; })]) // Start from 0
            // .domain(d3.extent(data, function(d) { return d[1]; }))
            .domain((alignLines)?
                [-50000000, 50000000] :
                [0, 100000000]

                )
            .range([height - margin.top - margin.bottom, 0]);

        data.lines.forEach(function (line) {
          line.points = [];
          var step= 1;
          for (var i=xScale.domain()[0]; i<= xScale.domain()[1]; i+=step ) {
            var x = xScale.domain()[0] + i;

            var p = (alignLines) ?
              [x,( line.m * x) ] :// Aligned lines
              [x,(line.m * x + line.b)]; // Regular lines

            p.obj = line;
            line.points.push(p);
          }
          // // Compute the points with only two points
          // line.points = [
          //   [xScale.domain()[0], xScale.domain()[0]* line.m + line.b ],
          //   [xScale.domain()[1], xScale.domain()[1]* line.m + line.b ],
          //   ];
        });
      }

      updateData();


      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g");

      gEnter.append("g").attr("class", "lines");
      gEnter.append("g").attr("class", "x axis");
      gEnter.append("g").attr("class", "y axis");
      gEnter.append("g").attr("class", "voronoi");

      focus = gEnter.append("g")
          .attr("transform", "translate(-100,-100)")
          .attr("class", "focus");

      focus.append("circle")
          .attr("r", 3.5);

      focus.append("text")
          .attr("y", -10);


      // Update the outer dimensions.
      svg .attr("width", width)
          .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


      function update() {
        // // Update the points.
        // var points = g.select(".points")
        //   .selectAll(".point")
        //   .data(function (d) { return d.points; });

        // points.enter()
        //   .append("circle")
        //   .attr("class", "point");

        // points
        //   .attr("cx", function (d) { return X(d); })
        //   .attr("cy", function (d) { return Y(d); })
        //   .attr("r", 3);
        //   // .attr("cx", function (d) { return X(d); })

        // points
        //   .exit().remove();

        // Update the lines.
        var lines = g.select(".lines")
          .selectAll(".line")
          .data(function (d) {
              return d.lines;
            }, function (d) {
              return d.name;
            });

        var voronois = g.select(".voronoi").selectAll("path")
              .data(voronoi(d3.nest()
                  .key(function(d) { return X(d) + "," + Y(d); })
                  .rollup(function(v) { return v[0]; })
                  .entries(d3.merge(data.lines.map(function(d) { return d.points; })))
                  .map(function(d) { return d.values; })));

        voronois
            .enter().append("path");
        voronois
              .attr("d", function(d) {
                return "M" + d.join("L") + "Z";
              })
              .datum(function(d) { return d.point; })
              .on("mouseover", mouseover)
              .on("mouseout", mouseout);
        voronois.exit().remove();

        // d3.select("#show-voronoi")
        //   .property("disabled", false)
        //   .on("change", function() { voronoiGroup.classed("voronoi--show", this.checked); });


        lines.enter()
          .append("path")
          .attr("class", "line");
        lines
          .transition().duration(1500)
          .attr("d", function (d) { d.line = this;return line(d.points); } );

        lines
          .exit().remove();




        // Update the x-axis.
        g.select(".x.axis")
            .attr("transform", "translate(0," + yScale.range()[0] + ")")
            .call(xAxis);


        // Update the y-axis.
        g.select(".y.axis")
            .attr("transform", "translate(" + xScale.range()[1] + ", 0)")
            .call(yAxis);


        g.select(".y.axis")
          .attr("opacity", alignLines? 0:1);


      }

      update();

      var alignButton = d3.select(this)
        .selectAll(".alignButton")
        .data([0]);

      alignButton.enter()
        .append("button")
        .attr("class", "alignButton")
        .text("Align");

      alignButton.on("click", function (d) {
        alignLines = !alignLines;
        updateData();
        update();

      });

    });
  }

  function mouseover(d) {
    d3.select(d.obj.line).classed("line--hover", true);
    d.obj.line.parentNode.appendChild(d.obj.line);
    console.log(d.obj.name);
    focus.attr("transform", "translate(" + X(d) + "," + Y(d) + ")");
    focus.select("text").text(d.obj.name);
  }

  function mouseout(d) {
    d3.select(d.obj.line).classed("line--hover", false);
    focus.attr("transform", "translate(-100,-100)");
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

