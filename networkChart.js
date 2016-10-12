

function networkChart() {
  var margin = {top: 20, right: 80, bottom: 20, left: 20},
      width = 760,
      height = 120,
      collision = true;



      var force  = d3.layout.forceInABox()
            .size([w, h])
            .treemapSize([w-300, h-300])
            .enableGrouping(d3.select("#checkboxGroup").property("checked"))
            .linkDistance(50)
            .gravityOverall(0.001)
            .linkStrengthInsideCluster(0.3)
            .linkStrengthInterCluster(0.05)
            .gravityToFoci(0.35)
            .charge(-100);

      var rScale = d3.scale.linear().range([2, 20]);
      var yScale = d3.scale.linear().range([h-20, 20]);
      var xScale = d3.scale.linear().domain(["a".charCodeAt(0), "z".charCodeAt(0)]).range([0, w]);
      var colScale = d3.scale.category20();
      var lOpacity = d3.scale.linear().range([0.1, 0.9]);



  function nodeName (d) {
    return d.name + " (" + d.value + ")";
  }

  function nodeNameCond (d) {
    return d.value > MIN_NODE_VAL ? nodeName(d): "";
  }

  function update( nodes, edges) {
    // force = d3.layout.force()
    force.stop();
    force
        .nodes(nodes)
        .links(edges)
        .enableGrouping(d3.select("#checkboxGroup").property("checked"))
        .on("tick", tick)
        .start();



    rScale.domain([0, d3.max(nodes, function (d) { return d.value; } )]);
    yScale.domain([0, d3.max(nodes, function (d) { return d.value; } )]);
    lOpacity.domain(d3.extent(edges, function (d) { return d.value; } ));



    var path = svg.select("#paths").selectAll("path")
        .data(force.links(), function (e) { return e.source.name + "|" + e.target.name; });
      path.enter().append("svg:path")
        .attr("class", function(d) { return "link "; })
        .style("stroke-width", "2px")
        .append("title")


    path.attr("marker-end", function(d) { return "url(#" + d.type + ")"; })
      .style("stroke-opacity", function(d) { return lOpacity(d.value); });

    path.select("title")
      .text(function (e) { return e.source.name + " to " + e.target.name + " (" + e.value + ")"; });

    path.exit().remove();


    var circle = svg.select("#nodes").selectAll("circle")
        .data(force.nodes(), function (d) { return d.name; });
    circle.enter().append("svg:circle")
        .attr("r", function (d) { return rScale(d.value); })
        .call(force.drag)
        .append("title")
        .text(nodeName);
    circle.style("fill", function (d) { return colScale(d.cluster); })
      .select("title")
      .text(nodeName);
    circle.exit().remove();


    var text = svg.select("#texts").selectAll("g")
      .data(force.nodes(), function (d) { return d.name; });

    var textEnter = text
        .enter().append("svg:g");

    // A copy of the text with a thick white stroke for legibility.
    textEnter.append("svg:text")
        .attr("x", 12)
        .attr("y", ".31em")
        .attr("class", "shadow");

    textEnter.append("svg:text")
        .attr("x", 12)
        .attr("y", ".31em")
        .attr("class", "foreground");

    text.select(".shadow").text(nodeNameCond);
    text.select(".foreground").text(nodeNameCond);

    text.exit().remove();

    // Use elliptical arc path segments to doubly-encode directionality.
    function tick(e) {
      force.onTick(e);

      //Collision detection
      var q = d3.geom.quadtree(nodes),
        k = e.alpha * 0.1,
        i = 0,
        n = nodes.length,
        o;

      while (++i < n) {
        o = nodes[i];
        // if (o.fixed) continue;
        // c = nodes[o.type];
        // o.x += (c.x - o.x) * k;
        // o.x += (xScale(o.name.charCodeAt(0)) - o.x) * k;
        // o.y += (yScale(o.value) - o.y) * k;
        q.visit(collide(o));
      }

      path.attr("d", function(d) {
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
      });

      circle.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

      text.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    }
  }

  function collide(node) {
    var r = rScale(node.value) + 16,
        nx1 = node.x - r,
        nx2 = node.x + r,
        ny1 = node.y - r,
        ny2 = node.y + r;
    return function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== node)) {
        var x = node.x - quad.point.x,
            y = node.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = rScale(node.value) + rScale(quad.point.value);
        if (l < r) {
          l = (l - r) / l * .5;
          node.px += x * l;
          node.py += y * l;
        }
      }
      return x1 > nx2
          || x2 < nx1
          || y1 > ny2
          || y2 < ny1;
    };
  }





  function chart(selection) {
    selection.each(function(data) {


      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);


      update(data.nodes, data.edges);



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
        .attr("class", "point");

      points
        .attr("cx", function (d) { return X(d); })
        .attr("cy", function (d) { return Y(d); })
        .attr("r", 3);
        // .attr("cx", function (d) { return X(d); })

      points
        .exit().remove();




    });
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



  return chart;
}

