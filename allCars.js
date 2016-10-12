/* jslint browser: true, devel: true, indent: 2 */
/* global scatterPlotChart, multipleLinesChart, d3_queue, d3, alert, console */

"use strict";


var chart = scatterPlotChart()
    .height(600)
    .width(800)
    .x(function (d) { return d.age; })
    .y(function (d) { return d.price; })
    .yFormat(d3.format("$s"));


var q = d3_queue.queue();

q
    .defer(d3.csv, "all.csv" )
    .defer(d3.csv, "lms_makers.csv")
    .defer(d3.csv, "lms_models.csv")
    .await(function(error, cars, lms_makers, lms_models) {
        if (error) {
            alert("Error loading data");
            console.error(error);
            return;
        }

        var yearNow = new Date().getFullYear();
        cars.forEach(function (d)  {
            d.age = yearNow + 1 - d.year;
            d.price = +d.price;
            d.kms = +d.kms;
        });

        var fnFixLms = function (line) {
            line.b = +line.b;
            line.m = +line.m;
            line.count = +line.count;
            line.name = line.maker;
        };

        lms_makers.forEach(fnFixLms);
        lms_models.forEach(fnFixLms);

        //Need to override the name
        lms_models.forEach(function (line) {
            line.name = line.maker + " " + line.model;
        });

        var data = {'points':cars,
            'lines':lms_models.filter(function (d) { return d.count > 10; })
        };


        d3.select("#chart")
            .datum(data.points)
            .call(chart);

    });
