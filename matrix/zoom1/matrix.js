var width = 100;
var height = 100;
var tree_height = 40;


var data = [[1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1,1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1,1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1],[4,5,4,10,0,11,11,11,1,1,1,1,1,1,1,1,1,1,1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1,1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1],[7,8,4,11,12,0,0,1,1,1,1,1,1,1,1,1,1,1,1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1,1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1],[1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1,1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1,1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1],[4,5,4,10,0,11,11,11,1,1,1,1,1,1,1,1,1,1,1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1,1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1],[7,8,4,11,12,0,0,1,1,1,1,1,1,1,1,1,1,1,1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1,1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1],[1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1,1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1,1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1],[4,5,4,10,0,11,11,11,1,1,1,1,1,1,1,1,1,1,1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1,1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1],[7,8,4,11,12,0,0,1,1,1,1,1,1,1,1,1,1,1,1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1,1,2,3,4,5,3,2,5,1,1,1,1,1,1,1,1,1,1]];
for (var i = 0 ; i < data.length ; i++) {
	for (var j = 0 ; j < data[i].length ; j++) {
		if( Math.random() > .5) {
			data[i][j] = Math.random()
		} else {
			data[i][j] = -1*Math.random()
		}
	}
}
var tree_json = {name:"root", 
				children:[
					{name:"1", children:[
						{name:"gene1"},
						{name:"gene2"},
						{name:"gene1"},
						{name:"gene2"},
						{name:"gene1"}]},
					{name:"1", children: [
						{name:"gene1"},
						{name:"gene2"},
						{name:"gene1"},
						{name:"gene2"}]}]};

var tree_json2 = {name: "root", children:[{name:"", children:[{name:"root", 
				children:[
					{name:"1", children:[
						{name:"gene1",children:[{name: "hi"},{name: "hi"},{name: "hi"},{name: "hi"},{name: "hi"}]},
						{name:"gene2"},
						{name:"", children:[{name: "hi"},{name: "hi"},{name: "hi"}]},
						{name:""}]},
					{name:"2", children:[
						{name:"gene3"},
						{name:"gene4"},
						{name:"1", children:[
						{name:"gene1"},
						{name:"gene2"}]}]}]},
				  {name:"root", 
				children:[
					{name:"1", children:[
						{name:"gene1"},
						{name:"gene2"},
						{name: ""}]},
					{name:"2", children:[
						{name:"gene3", children:[{name: "hi"},{name: "hi"},{name: "hi"}]},
						{name:"gene4"}]},
					{name:"1", children:[
						{name:"gene1"},
						{name: ""}]}]}]},
			{name:"", children:[{name:"root", 
				children:[
					{name:"1", children:[
						{name:"gene1"},
						{name:"gene2"},
						{name:""},
						{name:"", children:[{name: "hi"},{name: "hi"},{name: "hi"},{name: "hi"}]},
						{name:"", children: [{name: "hi"},{name: "hi"},{name: "hi"}]},
						{name:""}]},
					{name:"2", children:[
						{name:"gene3", children:[{name: "hi"},{name: "hi"},{name: "hi"},{name: "hi"}]},
						{name:"gene4"},
						{name:"1", children:[
						{name:"gene1"},
						{name:"gene2"}]}]}]},
				  {name:"root", 
				children:[
					{name:"1", children:[
						{name:"gene1"},
						{name:"gene2"},
						{name: ""},
						{name: ""}]},
					{name:"2", children:[
						{name:"gene3"},
						{name:"gene4", children:[{name: "hi"},{name: "hi"},{name: "hi"},{name: "hi"}]}]},
					{name:"1", children:[
						{name:"gene1"},
						{name:"gene2"},
						{name: ""},
						{name: ""}]}]}]}]}


	//Draws a matrix into group with dimensions (width x height) such that the matrix fills the space 				
var drawMatrix = function(data,width,height,group) {
	var h = data.length;
	var w = data[0].length;
	
	var xscale = d3.scale.ordinal()
			.domain(d3.range(0,w-1))
			.rangeRoundBands([0,width],1);
	var yscale = d3.scale.ordinal()
			.domain(d3.range(0,h-1))
			.rangeRoundBands([0,height],1);
	var box_color = d3.scale.linear()
				.domain([0,12])
				.range(["white","blue"]);

	var box_width = xscale(0);
	var box_height = yscale(0);

	for (var i = 0; i < h; i++) {
		cy = i == 0 ? 0 : yscale(i-1);
		for (var j = 0; j < w; j++) {
			cx = j == 0 ? 0 : xscale(j-1);
			group.append("rect")
				.attr("stroke","black")
				.attr("fill",box_color(data[i][j]))
				.attr("transform","translate(" + cx + "," + cy +")")
				.attr("width",box_width).attr("height",box_height);
		}
	}
}


// Draws a matrix whose cells are squares with sides
var drawSquareMatrix = function (data,side,group) {
	var h = data.length;
	var w = data[0].length;
	
	var box_color = d3.scale.linear()
				.domain([-1,0,1])
				.range(["red","white","blue"]);
	
	var cx = 0;
	var cy = 0;
	for (var i = 0; i < h; i++) {
		cy = side*i;
		for (var j = 0; j < w; j++) {
			cx = side*j;
			group.append("rect").attr("stroke","black")
				.attr("stroke-width",".5px")
				.attr("fill",box_color(data[i][j]))
				.attr("value",data[i][j])
				.attr("transform","translate(" + (cx+1.5*j) + "," + (cy+1.5*i) +")")
				.attr("width",side).attr("height",side)
				.attr("row", i)
				.attr("col", j);
		}
	}

	return [(w*(1.5+side)-2),(h*(1.5+side)-2)];
}

// Draws a tree into group using data 
var drawTree = function (data, dim, group) {

	var cluster = d3.layout.cluster()
	    .size(dim)
	    .separation(function(a,b) { return 1; });

	// Makes tree with square links between nodes
	function elbow(d, i) {
	  return "M" + d.source.y + "," + d.source.x
	      + "V" + d.target.x + "H" + d.target.y;
	}

	var nodes = cluster.nodes(data);
	var link = group.selectAll(".link")
	  .data(cluster.links(nodes))
	.enter().append("path")
	    .style("fill","none")
	  	.style("stroke","black")
	  	.style("stroke-width",".5px")
		.attr("d", elbow);
}
var zoom = d3.behavior.zoom().scaleExtent([1, 4]).on("zoom",zoomer);
var prev_scale = 1;
var side = 10;
var matrix = d3.select("#matrix").append("svg")
	.call(zoom)
	.attr("width",(2*data[0].length*(1.5+side)))
	.attr("height",(2*data.length*(1.5+side)))
	.append("g");

matrix.append("rect")
		.attr("width",(data[0].length*(1.5+side)))
		.attr("height",(data.length*(1.5+side)))
		.attr("fill","white");


var dim = drawSquareMatrix(data,side,matrix);

var vertical_tree =d3.select("#side_tree")
						.append("svg")
							.attr("width",tree_height)
							.attr("height",2*dim[1])
						.append("g");
var horizontal_tree_wrapper = d3.select("#top_tree")
						.append("svg")
							.attr("width",2*dim[0])
							.attr("height",tree_height)
						.append("g");

var horizontal_tree = horizontal_tree_wrapper.append("g");

drawTree(tree_json,[dim[1],tree_height],vertical_tree);
drawTree(tree_json2,[dim[0],tree_height],horizontal_tree);

horizontal_tree.attr("transform","translate("+ (dim[0]) +",0) rotate(90)");

function zoomer() {
	var t = d3.event.translate,
		s = d3.event.scale;
  matrix.attr("transform", "translate(" + t + ")scale(" + s + ")");
  vertical_tree.attr("transform", "translate(" + (tree_height - s*tree_height) +","+ t[1] + ")scale(" + s + ")");
  horizontal_tree_wrapper.attr("transform", "translate(" + t[0] + ","+ (tree_height - s*tree_height) +")scale(" + s + ")");
  prev_scale = s;
}

function zoomer2() {
	var t = d3.event.translate,
		s = d3.event.scale;
  matrix.attr("transform", "translate(" + t + ")scale(" + s + ")");
  vertical_tree.attr("transform", "translate(" + 0 +","+ t[1] + ")scale(1," + s + ")");
  horizontal_tree_wrapper.attr("transform", "translate(" + t[0] + ","+ 0 +")scale(" + s + ",1)");
  prev_scale = s;
}

d3.selectAll("rect")
	.on('mouseover',function () { d3.select(this).attr({opacity: 0}) })
	.on('mouseout',function () { d3.select(this).attr({opacity: 1})});

