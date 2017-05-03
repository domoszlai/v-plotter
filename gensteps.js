var fs = require('fs');

var gcode = require("./gcode");
var interpreter = require("./interpreter");
var config = require("./config").config; 

main();

// The actual drawing area. (0,0) is supposed to be the center of the shaft of the left motor
var bbox = {x: config.E, y: config.F, width: config.G-config.suspensionMargin, height: config.H-config.suspensionMargin};

// lengths for home position
var il1 = length1(0,0);
var il2 = length2(0,0);

function length1(x,y)
{
    x += bbox.x-config.suspensionMargin-config.A;
    y += bbox.y-config.suspensionMargin-config.C;
    return Math.sqrt((x*x) + (y*y));
}

function length2(x,y)
{
    x += bbox.x-config.suspensionMargin+config.B;
    y += bbox.y-config.suspensionMargin-config.C;
    return Math.sqrt(((config.D-x)*(config.D-x)) + (y*y));
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
        var x = config.mm(points[i].x);
        var y = config.mm(points[i].y);

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
		
		var inter = new interpreter.interpreter(gcodes, config.resolution);
		var points = inter.toPoints();
	    
		var movements = toLengths(points);
		
		var l1error = 0;
		var l2error = 0;
		
		var lines = [];
		
		for (var idx in movements)
		{
			var m = movements[idx];
						
			// Accumulate the error, and try to correct it at the next step
			var l1steps = Math.round((m.l1+l1error)/config.steplength);
			var l2steps = Math.round((m.l2+l2error)/config.steplength);
							
			l1error += m.l1 - l1steps * config.steplength;
			l2error += m.l2 - l2steps * config.steplength;
			
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





