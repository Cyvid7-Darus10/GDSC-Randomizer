$(function () {
    $("#start").click(function() {
        console.log("hey");
    });

    $("#randomize").click(function() {
        loadData();
        startWheel();
        $("#div-inputs").css("display","none");
        $("#items-holder").css("display","none");
    });

    $(document).keypress(function(e) {
        if(e.which == 13) {
            let item = $("#item").val();
            $("#item").val("")
            if (item != "") {
                items.push(item);
                updateList();
            }
        }
    });
});

var items = [];
var color = ["red", "blue", "yellow", "green"];
var colors = ["#4e84dd", "#d54f44", "#e2b01d", "#20975f"];

var data = [];

function loadData() {
    items.forEach(function(item, i) {
        let d = {"label":item,  "value":i,  "question":item};
        data.push(d);
    });
}

function updateList() {
    $("#items-holder").html("");
    let unorderList = "";
    items.forEach(function(item, i) {
        unorderList += "<li class="+ color[i%4]+">" + item + "</li>";
    });

    $("#items-holder").html(unorderList);
}

function startWheel() {
    var padding = {top:20, right:40, bottom:0, left:0},
            w = 500 - padding.left - padding.right,
            h = 500 - padding.top  - padding.bottom,
            r = Math.min(w, h)/2,
            rotation = 0,
            oldrotation = 0,
            picked = 100000,
            oldpick = [],
            color = d3.scale.category20();

    var svg = d3.select('#chart')
        .append("svg")
        .data([data])
        .attr("width",  w + padding.left + padding.right)
        .attr("height", h + padding.top + padding.bottom);
    var container = svg.append("g")
        .attr("class", "chartholder")
        .attr("transform", "translate(" + (w/2 + padding.left) + "," + (h/2 + padding.top) + ")");
    var vis = container
        .append("g");
        
    var pie = d3.layout.pie().sort(null).value(function(d){return 1;});
    // declare an arc generator function
    var arc = d3.svg.arc().outerRadius(r);
    // select paths, use arc generator to draw
    var arcs = vis.selectAll("g.slice")
        .data(pie)
        .enter()
        .append("g")
        .attr("class", "slice");
        
    arcs.append("path")
        .attr("fill", function(d, i){ return colors[i%4]; })
        .attr("d", function (d) { return arc(d); });

    arcs.append("text").attr("transform", function(d){
            d.innerRadius = 0;
            d.outerRadius = r;
            d.angle = (d.startAngle + d.endAngle)/2;
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")translate(" + (d.outerRadius -10) +")";
        })
        .attr("text-anchor", "end")
        .text( function(d, i) {
            return data[i].label;
        });
    container.on("click", spin);

    function spin(d){
        
        container.on("click", null);
        //all slices have been seen, all done
        console.log("OldPick: " + oldpick.length, "Data length: " + data.length);
        if(oldpick.length == data.length){
            console.log("done");
            container.on("click", null);
            return;
        }
        var  ps       = 360/data.length,
                pieslice = Math.round(1440/data.length),
                rng      = Math.floor((Math.random() * 1440) + 360);
            
        rotation = (Math.round(rng / ps) * ps);
        
        picked = Math.round(data.length - (rotation % 360)/ps);
        picked = picked >= data.length ? (picked % data.length) : picked;
        if(oldpick.indexOf(picked) !== -1){
            d3.select(this).call(spin);
            return;
        } else {
            oldpick.push(picked);
        }
        rotation += 90 - Math.round(ps/2);
        vis.transition()
            .duration(12000)
            .attrTween("transform", rotTween)
            .each("end", function(){
                //mark question as seen
                d3.select(".slice:nth-child(" + (picked + 1) + ") path")
                    .attr("fill", "#111");
                //populate question
                d3.select("#question h1")
                    .text(data[picked].question);
                $("#question h1").css('color', colors[picked%4]);
                oldrotation = rotation;
                container.on("click", spin);
            });
    }

    svg.append("g")
        .attr("transform", "translate(" + (w + padding.left + padding.right) + "," + ((h/2)+padding.top) + ")")
        .append("path")
        .attr("d", "M-" + (r*.15) + ",0L0," + (r*.05) + "L0,-" + (r*.05) + "Z")
        .style({"fill":"black"});

    container.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 60)
        .style({"fill":"white","cursor":"pointer"});

    container.append("text")
        .attr("x", 0)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .text("GDSC")
        .style({"font-weight":"bold", "font-size":"30px"});
    
    
    function rotTween(to) {
        var i = d3.interpolate(oldrotation % 360, rotation);
        return function(t) {
        return "rotate(" + i(t) + ")";
        };
    }
    
    
    function getRandomNumbers(){
        var array = new Uint16Array(1000);
        var scale = d3.scale.linear().range([360, 1440]).domain([0, 100000]);
        if(window.hasOwnProperty("crypto") && typeof window.crypto.getRandomValues === "function"){
            window.crypto.getRandomValues(array);
            console.log("works");
        } else {
            for(var i=0; i < 1000; i++){
                array[i] = Math.floor(Math.random() * 100000) + 1;
            }
        }
        return array;
    }
}
