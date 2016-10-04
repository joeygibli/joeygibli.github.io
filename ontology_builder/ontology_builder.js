// Initial modified script (with node coloring): http://bl.ocks.org/d3noob/8043434
// Force Layout information: 
// Probably useful for color: https://gist.github.com/mbostock/3014589

var config = {
    edgeMod:'altKey',
    width:800,
    height:700,
    linkdistance:60,
    linkcharge:400,
    edgeStyle:'straight',
};

var next_id=0;
// Set the range
var nv = d3.scale.linear().range([0, 1]);
var lv = d3.scale.linear().range([0, 100]);

var model = {
    nodes : {},
    nodesByName : false,
    nodesList : false,
    graph : {},
    igraph: {},
    force : false,
    links : false,
    path : false,
    node : false,
    svg : false,
    // support for edge add/removal
    add_source : null,
    add_target : null
}

var uniqueNode = function(name,wt) {
    if (!wt) { wt=1; }
    return model.nodes[name] || 
	(model.nodes[name] = {name:name,id:(next_id+=1),value:wt,update:false});
};
var connect = function(src,dst) {
    if (!(src.name in model.graph)) { model.graph[src.name] = {}; }
    if (!(dst.name in model.igraph)) { model.igraph[dst.name] = {}; }
    model.graph[src.name][dst.name] = true;
    model.igraph[dst.name][src.name] = true;
};
var disconnect = function(src,dst) {
    delete model.graph[src.name][dst.name];
    delete model.igraph[dst.name][src.name];
};
var connected = function(src,dst) {
    console.log(src);
    console.log(dst);
    console.log(model.graph[src.name]);
    return (src.name in model.graph && dst.name in model.graph[src.name]);
}

// add the edges //curvy lines
function tick() {
    if (!model.path) { return; }
    if (!model.node) { return; }
    model.path.attr("d", function(d) {
	var dx = d.target.x - d.source.x,
	dy = d.target.y - d.source.y,
	dr = Math.sqrt(dx * dx + dy * dy)*1.5;
	var ret = "M" + 
	    d.source.x + ",";
	
	if (config.edgeStyle=="straight") {// straight paths:
	    ret = ret + d.source.y + "L";
	} else {	    
	    // curved paths:
	    ret =  ret + d.source.y + "A" + 
		dr + "," + dr + " 0 0,1 ";
	}
	
	return ret + d.target.x + "," + 
	    d.target.y;
    });
    model.node
	.attr("transform", function(d) { 
	    return "translate(" + d.x + "," + d.y + ")"; });
}
// redraw paths between nodes
function drawPaths() {
    model.path = model.svg.select("#link-paths").selectAll("path")
	.data(model.force.links())
	.enter().append("svg:path")
	.style("opacity",function(d) { return d.value; })
	.attr("class", "link")
	.attr("marker-end", "url(#end)");
}

function size(x) {
    if (!x) { return 0; }
    var n=0;
    for (k in x) {
	if (x.hasOwnProperty(k)) { n++; }
    }
    return n;
}

// attempt to automatically arrange graph sensibly
function autoArrange() {
    // compute outdegree and indegree of each node
    var outdegree={},indegree={},shortlist=[],longlist=[];
    for (ni in model.force.nodes()) {
	var node = model.force.nodes()[ni]
	outdegree[node.name] = size(model.graph[node.name]);
	indegree[node.name] = size(model.igraph[node.name]);
	if (indegree[node.name]==0) { shortlist.push(node); }
	if (indegree[node.name] < outdegree[node.name]) { longlist.push(node); }
	free("#node_"+node.id,node);
    }
    var descendingOutdegree = function (x,y) { return outdegree[y.name] - outdegree[x.name]; };
    shortlist.sort(descendingOutdegree);
    //shortlist = shortlist + longlist.sort(function(x,y) { return (indegree[x.name] - indegree[y.name]) || descendingOutdegree(x,y); });
    
    for (i=0; i<12; i++) {
	var theta = i * 5 * Math.PI / 6;
	var n = shortlist[i];
	if (!n) { console.log("Not enough shortlisted nodes"); break; }
	
	n.x=n.px= Math.cos(theta) * config.height * 4/9 + config.width/2;
	n.y=n.py= Math.sin(theta) * config.height * 4/9 + config.height/2;
	fix("#node_"+n.id,n);
	model.force.resume();
    }

}

// action to take on mouse double click
function dblclick(d) {
    free(this,d);
}
// make nodes fixed when dragged
function dragstart(d) {
    fix(this,d);
}

function free(selector,d) {
    d3.select(selector).classed("fixed", d.fixed = false);
    d3.select(selector).select("circle")
	.style("stroke", function(d) {return makeRgb(nv(d.value)); });
}
function fix(selector,d) {
  d3.select(selector).classed("fixed", d.fixed = true);
  d3.select(selector).select("circle").style("stroke", "firebrick");
}

var drag = function() {}

// turn off any node hilighting
function resetNodeFill(n) {
    d3.select("#node_"+n.id).select("circle").style("fill",function(d) {return makeRgb(nv(d.value)); });
}

// clear state of edge selection machinery
function clearEdgeMod() {
    if (model.add_source) {
	resetNodeFill(model.add_source);
    }
    model.add_source = null;
    if (model.add_target) {
	resetNodeFill(model.add_target);
    }
    model.add_target = null;
}

// handle click events
function clicked(d) {
  // remove nodes when click with shift key
  if(d3.event.shiftKey) {
      model.links = model.links.filter(function(link) {
	  return !(link.source == d || link.target == d);
      });
      d3.values(model.nodes).filter(function(n) {
	  return n != d.name;
      });
      model.force.nodes(d3.values(model.nodes));
      model.force.links(model.links);
      
      d3.selectAll(".link").remove();
      drawPaths();
      
      d3.select(this).select("circle").transition()
	  .duration(600)
	  .attr("r", 0)
	  .remove();
      d3.select(this).select("text").transition()
	  .remove();
      d3.select("#node_"+d.id).remove();
  }

  // add or remove edges when alt is pressed
  if(d3.event[config.edgeMod]) {
    if (model.add_source == null) {
      model.add_source = d;
      d3.select(this).select("circle").style("fill","cyan");
      console.log("src: " + d.name + " x = " + d.x + ", y = " + d.y);
    } else if (model.add_target == null && d != model.add_source) {
	// note: when modifying edges stop force layout to avoid calucation errors
	model.force.stop();
	model.add_target = d;
	d3.select(this).select("circle").style("fill","cyan");
	console.log("dst: " + d.name + " x = " + d.x + ", y = " + d.y);
	var edge_exists = -1;
	if (connected(model.add_source,model.add_target)) {
	    for (var i = 0; i < model.links.length; i++) {
		if (model.links[i].source == model.add_source && model.links[i].target == model.add_target) {
		    edge_exists = i;
		    break;
		}
	    }
	    console.log("edge exists at "+edge_exists);
	    console.log(model.graph[model.add_source]);
	    model.links.splice(edge_exists, 1);
	    disconnect(model.add_source,model.add_target);
	    console.log("removing");
	} else {
	    model.links.push({source: model.add_source, target: model.add_target, value:1.0, type: "onezerozero"});
	    connect(model.add_source,model.add_target);
	    console.log("adding");   
	}
	clearEdgeMod();
	d3.selectAll(".link").remove();
	model.force.links(model.links);
	drawPaths();
	model.force.start();
    }
  }
}



// h/t https://thiscouldbebetter.wordpress.com/2012/12/18/loading-editing-and-saving-a-text-file-in-html5-using-javascrip/
function fetchLinkFile() {
    var fileToLoad = document.getElementById("linkfile").files[0];
    loadLinks(fileToLoad);
}

function todo() {
    var fileToLoad = document.getElementById("fileToLoad").files[0];
 
    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent) 
    {
        var textFromFileLoaded = fileLoadedEvent.target.result;
        document.getElementById("inputTextToSave").value = textFromFileLoaded;
    };
    fileReader.readAsText(fileToLoad, "UTF-8");
}

function fetchNodeFile() {
    var fileToLoad = document.getElementById("nodefile").files[0];
    loadNodes(fileToLoad);
}   

// h/t https://thiscouldbebetter.wordpress.com/2012/12/18/loading-editing-and-saving-a-text-file-in-html5-using-javascrip/
function save() {
    var textToSave = "# ontology built "+Date();
    for (link in model.links) {
	textToSave += link.source.name + "\t" + link.target.name;
    }

    var textToSaveAsBlob = new Blob([textToSave], {type:"text/plain"});
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
    var fileNameToSaveAs = "ontology.tsv";
    
    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    downloadLink.onclick = function(event) { 
	document.body.removeChild(event.target); 
    };
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    
    downloadLink.click();
}
    
function updateEdgeSelect() {
    config.edgeMod = document.getElementById("edgeselect").value;
    document.getElementById("edgeselectDoc").innerHTML = config.edgeMod.slice(0,config.edgeMod.length-3);
}
function updateLinkLength() {
    if (!model.force) { return; }
    config.linkdistance = document.getElementById("linklength").value;
    model.force.stop();
    model.force.linkDistance(config.linkdistance);
    model.force.start();
}
function updateLinkCharge() {
    if (!model.force) { return; }
    config.linkcharge = document.getElementById("linkcharge").value;
    model.force.stop();
    model.force.charge(-config.linkcharge);
    model.force.start();
}

function updateEdgeStyle(s) {
    console.log(s);
    model.force.stop();
    config.edgeStyle=s
    model.force.start();
}

function addNodeFromList() {
    var list = document.getElementById("addchoice").options;
    var candidates = [];
    for (i in list) {
	if (list[i].selected) { 
	    candidates.push(list[i].value); 
	    list.remove(i);
	}
    }
    model.force.stop();
    for (i in candidates) {
	var node = model.nodes[candidates[i]];
	node.x=node.px= (Math.random()-0.5) * 2/3 * config.width + config.width/2;
	node.y=node.py= (Math.random()-0.5) * 2/3 * config.height + config.height/2;
	model.force.nodes().push(node);
    }
    model.force.resume();
    model.svg.select(".node").remove();
    defineNodes();
}

function deleteNodeFromList() {
    var list = document.getElementById("addchoice").options;
    var remlist = [];
    for (i in list) {
	if (list[i].selected) { 
	    remlist.push(i);
	}
    }
    for (i in remlist) { list.remove(remlist[i]); }
}

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

function clearDisplay() {
    model.nodes = {};
    model.graph = {};
    model.links = false;
    model.force.stop();
    model.force.nodes([]).links([]);
    d3.selectAll(".node").remove();
    d3.selectAll(".link").remove();
    next_id=0;
    console.log("display cleared");
}

function makeRgb(value) { // gray
    var bit8 = Math.floor(128 + 96 * (1-value));
    return "rgb("+bit8+","+bit8+","+bit8+")";
}

function defineNodes(theNodes) {
    nv.domain([0, d3.max(model.force.nodes(), function(d) { return d.value; })]);

    // define the nodes
    model.node = model.svg.selectAll(".node")
	.data(model.force.nodes())
	.enter().append("g")
	.attr("class", "node")
	.attr("id",function(d) { return "node_" + d.id; })
	.on("dblclick", dblclick)
	.call(drag)
	.on("click",clicked);

    // add the nodes
    model.node.append("circle")
	.attr("r", 5)
	//.style("fill", "grey")
	//.style("opacity",function (d) { return nv(d.value); });
	.style("stroke", function(d) {return (d.fixed && "firebrick") || makeRgb(nv(d.value)); })
	.style("fill", function(d) {return makeRgb(nv(d.value)); });

    // add the text 
    model.node.append("text")
	.attr("x", 12)
	.attr("dy", ".35em")
	.style("fill",function(d) {return makeRgb(nv(d.value)/2+0.5); })
    //.style("opacity",function (d) { return nv(d.value)/2+0.5; })
	.text(function(d) { return d.name; });
}

var loadLinks = function(filepath) {
    d3.csv(filepath) // get the data from file
	.row(function(link) { // parse
	    var ret = { // Compute the distinct nodes from the links.
		source: uniqueNode(link.source),
		target: uniqueNode(link.target),
		value: +link.value,
		type:"na"};
	    connect(ret.source,ret.target);
	    return ret;
	}).get(function(error, links) { //process
	    if (error) { console.log("Error: "+error); }

	    model.links = links;

	    // insert data into force layout
	    model.force.stop();
	    model.force.nodes(d3.values(model.nodes)) // data used for the nodes
		.links(model.links) // data used for the links
		.start();



	    // Scale the range of the data
	    lv.domain([0, d3.max(model.links, function(d) { return d.value; })]);

	    // asign a type per value to encode opacity
	    // model.links.forEach(function(link) {
	    // 	      var s = v(link.value);
	    // 	      if (s <= 25) {
	    // 		      link.type = "twofive";
	    // 	      } else if (s <= 50 && s > 25) {
	    // 		      link.type = "fivezero";
	    // 	      } else if (s <= 75 && s > 50) {
	    // 		      link.type = "sevenfive";
	    // 	      } else if (s <= 100 && s > 75) {
	    // 		      link.type = "onezerozero";
	    // 	      } else {
	    // 		      link.type = "invalid";
	    // 	      }
	    // });


	    // // build the arrow.
	    // model.svg.append("svg:defs").selectAll("marker")
	    // 	.data(["end"])      // Different link/path types can be defined here
	    // 	.enter().append("svg:marker")    // This section adds in the arrows
	    // 	.attr("id", String)
	    // 	.attr("viewBox", "0 -5 10 10")
	    // 	.attr("refX", 15)
	    // 	.attr("refY", -1.5)
	    // 	.attr("markerWidth", 6)
	    // 	.attr("markerHeight", 6)
	    // 	.attr("orient", "auto")
	    // 	.append("svg:path")
	    // 	.attr("d", "M0,-5L10,0L0,5");

	    // // add the links and the arrows
	    // model.path = model.svg.append("svg:g").attr("id","link-paths").selectAll("path")
	    // 	.data(model.force.links())
	    // 	.enter().append("svg:path")
	    // 	.style("opacity",function(d) { return d.value; })
	    // 	.attr("class", "link")
	    // 	.attr("marker-end", "url(#end)");
	    drawPaths();

	    var nodes = [];
	    for (k in model.nodes) { nodes.push(model.nodes[k]); }
	    defineNodes(nodes);
	});
}

function loadNodes(filepath) {
    d3.csv(filepath) 
	.row(function(node) { // parse
	    ret = model.nodes[node.name]
	    if (ret) {
		ret.value = +node.value;
		ret.update = true;
	    }
	    // unique
	    // if (node.value>1 && node.name in model.nodes) {
	    // 	model.nodes[node.name].value=node.value;
	    // }
	    
	    if (node.value>1) { uniqueNode(node.name,+node.value); }
	    
	    return model.nodes[node.name];
	}).get(function (error,nodes) { // process
	    if (error) { console.log("Error:");console.log(error); }
	    var listnodes = nodes.filter(function(x){return !x.update});
	    console.log("Added node weight to "+(nodes.length-listnodes.length)+" nodes");
	    //model.force.stop();
	    //model.force.nodes(d3.values(nodes));
	    //model.force.start();
	    
	    d3.select("#addchoice").selectAll("option")
		.data(listnodes)
		.enter().append("option")
		.attr("value",function(d) {return d.name})
		.attr("title",function(d) {return d.name+" ("+d.value+")"})
		.text(function(d) {return d.name+" ("+d.value+")"});
	    document.getElementById("addbutton").disabled=false;
	    document.getElementById("delbutton").disabled=false;
	    
	    d3.selectAll(".node").remove();
	    var nodes = [];
	    for (k in model.nodes) { nodes.push(model.nodes[k]); }
	    defineNodes(nodes);
	});
}
init();
loadLinks("test.csv");

