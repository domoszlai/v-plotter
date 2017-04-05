var fs = require('fs');

var gcode = require("./gcode");
var interpreter = require("./interpreter");

main();

// -----------------------------------------------------------------------------
// CONFIGURATION

// For explanation, see configuration.png
var a = cm(0);
var b = cm(0);
var c = cm(0);
var d = m(1)-cm(6);
var e = cm(10);
var f = cm(10);
var g = cm(80);
var h = cm(80);

// Split paths around this length (mm)
var resolution = 0.5;
// Stepper motor resolution (mm per one step)
var steplength = 0.2;

// The distance between the edge of the world and the middle of the suspension boxes. 
// make it cm(0) for real world, and cm(3) for the simulator
var suspensionMargin = cm(0);

// /CONFIGURATION
// -----------------------------------------------------------------------------

// The actual drawing area. (0,0) is supposed to be the center of the shaft of the left motor
var bbox = {x: e, y: f, width: g-suspensionMargin, height: h-suspensionMargin};

// lengths for home position
var il1 = length1(0,0);
var il2 = length2(0,0);

function inch(d)
{
	return mm(d)*2.54;
}

function mm(d)
{
	return d;
}

function cm(d)
{
	return d*10;
}

function m(d)
{
	return d*1000;
}

function length1(x,y)
{
    x += bbox.x-suspensionMargin-a;
    y += bbox.y-suspensionMargin-c;
    return Math.sqrt((x*x) + (y*y));
}

function length2(x,y)
{
    x += bbox.x-suspensionMargin+b;
    y += bbox.y-suspensionMargin-c;
    return Math.sqrt(((d-x)*(d-x)) + (y*y));
}

// Coordinate transformation
function toLengths(points)
{
    var movements = [];
    
    var cl1 = il1;
    var cl2 = il2;

    for(var i=0; i<points.length; i++)
    {
        // Points are in mm, convert them to meter as box2d likes
        var x = mm(points[i].x);
        var y = mm(points[i].y);

        var l1 = length1(x,y);
        var l2 = length2(x,y);
        
        movements.push({l1: l1-cl1, l2: l2-cl2, drawing: points[i].drawing});
        
        cl1 = l1;
        cl2 = l2;
    }
	
	return movements;
}

function processGCode(err, data)
{
	if (err) 
	{
		return process.stderr.write(err);
	}
	else
	{
		var gcodes = gcode.parseGCode(data);
		
		// go home at the end
		gcodes.push({type: 'G0', args: {X:0,Y:0}});
		gcodes.push({type: 'G0', args: {Z:0}});		
		
		var inter = new interpreter.interpreter(gcodes, resolution);
		var points = inter.toPoints();
			
		var movements = toLengths(points);
		
		var l1error = 0;
		var l2error = 0;
		
		var lines = [];
		
		for (var idx in movements)
		{
			var m = movements[idx];
						
			// Accumulate the error, and try to correct it at the next step
			var l1steps = Math.round((m.l1+l1error)/steplength);
			var l2steps = Math.round((m.l2+l2error)/steplength);
							
			l1error += m.l1 - l1steps * steplength;
			l2error += m.l2 - l2steps * steplength;
			
			lines.push(l1steps + " " + l2steps + " " + (m.drawing ? "1" : "0") + "\n")
		}		
		
		for(var idx in lines)
		{			
			process.stdout.write(lines[idx]);
		}
	}
}

function main()
{
	if(process.argv.length == 3)
	{
		fs.readFile(process.argv[2], 'utf8', processGCode);
	}
	else
	{
		process.stdout.write("Usage: " + process.argv[0] + " " + process.argv[1] + " gcodefile");	
	}
}





