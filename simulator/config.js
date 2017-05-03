// Plotter specific settings
// --------------------------------------------------------------

var D = m(1)-cm(6);
var E = cm(10);
var F = cm(10);
var G = cm(80);
var H = cm(80);

// Emulator specific settings
// --------------------------------------------------------------

// the distance between the edge of the world and the middle of the suspension boxes
var suspensionMargin = cm(3);

// box2d to canvas scale: 1 metre in box2d = 600px of canvas
var scale = 600;

// frame per sec for the world
var fps = 60;

// Stepper motor resolution (mm per one step)
var steplength = 0.2;

// --------------------------------------------------------------------------------

function inch(d)
{
	return mm(d)*2.54;
}

function mm(d)
{
	return d/1000;
}

function cm(d)
{
	return d/100;
}

function m(d)
{
	return d;
}