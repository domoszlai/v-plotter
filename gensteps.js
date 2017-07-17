var fs = require('fs');
var argv = require("argv");

var gcode = require("./gcode");
var interpreter = require("./interpreter");
var config = require("./config").config; 
var trans = require("./transformation").transformation(config);

var args = argv.option([
    {
        name: 'speed',
        short: 's',
        type: 'int'
    },
    {
        name: 'help',
        short: 'h',
        type: 'boolean'
    }        
]).run();

if(args.targets.length == 1 && !args.options.help)
{
    fs.readFile(args.targets[0], 'utf8', function(err, data){
        if (err) 
        {
            return Console.log('Error: ', err.message);;
        }
        else
        {        
            var maxspeed = args.options.speed;
            if(!maxspeed || maxspeed < 1 || maxspeed > 100) maxspeed = 5;
                
            processGCode(data, maxspeed);
        };
       
    });;
}
else
{
   console.info('Usage: gensteps.js <gcodefile> [options] \n\
\n\
        --help, -h \n\
                Displays help information about this script \n\
\n\
        --speed speed, -s speed\n\
                 Maximum speed in mm/sec. Valid between 1 and 100, default is 5. \n\
                 ');
}

// ----------------------------------------------------------------------------

// The actual drawing area. (0,0) is supposed to be the center of the shaft of the left motor
var bbox = {x: config.E, y: config.F, width: config.G-config.suspensionMargin, height: config.H-config.suspensionMargin};

// lengths for home position
var ils = trans.calcLengths(0,0);
var il1 = ils.lLeft;
var il2 = ils.lRight;

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

        var lengths = trans.calcLengths(x, y);
        var l1 = lengths.lLeft;
        var l2 = lengths.lRight;
        
        movements.push({l1: l1-cl1, l2: l2-cl2, drawing: points[i].drawing});
        
        cl1 = l1;
        cl2 = l2;
    }
	
	return movements;
}

function processGCode(data, maxspeed)
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
    
    var drawing = false;
    
    lines.push("1 " + maxspeed + "\n");
    lines.push("2 0\n"); // pen off
    
    for (var idx in movements)
    {
        var m = movements[idx];
                    
        // Accumulate the error, and try to correct it at the next step
        var l1steps = Math.round((m.l1+l1error)/config.steplength);
        var l2steps = Math.round((m.l2+l2error)/config.steplength);
                        
        l1error += m.l1 - l1steps * config.steplength;
        l2error += m.l2 - l2steps * config.steplength;
        
        if(m.drawing != drawing)
        {
            lines.push("2 " + (m.drawing ? "1" : "0") + "\n");
            drawing = m.drawing;
        }
        
        lines.push("3 " + l1steps + " " + l2steps + "\n");
    }		
    
    for(var idx in lines)
    {			
        process.stdout.write(lines[idx]);
    }
}






