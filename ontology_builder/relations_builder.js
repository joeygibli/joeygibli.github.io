var config = {
    width:800,
    height:700,
    linkdistance:60,
    linkcharge:400,
};


var init = function() {
    // define parameters for force layout
    model.force = d3.layout.force()
	.size([config.width, config.height])
	.linkDistance(config.linkdistance) // min distance of links
    //.linkStrength(function(link) { return link.value*2 }) // lower strength means link isn't as rigid [0,1]
	.charge(-config.linkcharge) // amount nodes repell each other
	.chargeDistance(250) // how far the charge takes effect
	.friction(.5) // higher frictions means nodes move around less [0,1]
	.on("tick", tick);
    model.svg = d3.select("#display").append("svg")
	.attr("width", config.width)
	.attr("height", config.height);
    model.svg.append("svg:defs").selectAll("marker")
	.data(["end"])      // Different link/path types can be defined here
	.enter().append("svg:marker")    // This section adds in the arrows
	.attr("id", String)
	.attr("viewBox", "0 -5 10 10")
	.attr("refX", 15)
	.attr("refY", 0)
	.attr("markerWidth", 6)
	.attr("markerHeight", 6)
	.attr("orient", "auto")
	.append("svg:path")
	.attr("d", "M0,-5L10,0L0,5");
    model.svg.append("svg:g").attr("id","link-paths");

    // make fixed when node is dragged
    drag = model.force.drag()
	.on("dragstart", dragstart);
    d3.select("#display")
	.on("keyup", clearEdgeMod);

    document.getElementById("edgeselect").value = config.edgeMod;
    document.getElementById("linklength").value = config.linkdistance;
    document.getElementById("linkcharge").value = config.linkcharge;
}
