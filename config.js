var config = {
    
    // see: configuration.png
    A: cm(5),
    B: cm(5),
    C: cm(5),
    D: m(1)-cm(6),
    E: cm(10),
    F: cm(10),
    G: cm(80),
    H: cm(80),

    // Split paths around this length (mm)
    resolution: 0.5,
    // Stepper motor resolution (mm per one step)
    steplength: 0.2,

    // The distance between the edge of the world and the middle of the suspension boxes. 
    // make it cm(0) for real world, and cm(3) for the simulator
    suspensionMargin: cm(0),    
    
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
