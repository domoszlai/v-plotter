var SPROCKET_DIAMETER = 12.73; 	// Sprocket radius in mm. GT2 pulley 20 teeth
var STEPS_PER_REVOLUTION = 180;	// Stepper motor steps per revolution
var MICROSTEPPING = 1;		    // Stepper driver microstepping (1 = disabled)

var config = {
    
    // see: configuration.png
    A: cm(5),
    B: cm(5),
    C: cm(5),
    D: cm(100),
    E: cm(10),
    F: cm(10),
    G: cm(80),
    H: cm(80),

    // Split paths around this length (mm)
    resolution: 0.5,
    // Stepper motor resolution (mm per one step). Set it 0.2 for the simulator
    steplength: (SPROCKET_DIAMETER*3.14) / (STEPS_PER_REVOLUTION * MICROSTEPPING),
    
    inch: inch,
    mm: mm,
    cm: cm,
    m: m
}

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

if (typeof module !== 'undefined' && module.exports) 
{
	exports.config = config;
}
