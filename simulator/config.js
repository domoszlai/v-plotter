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

    // box2d to canvas scale: 1 metre in box2d = 600px of canvas
    scale: 600,

    // frame per sec for the world
    fps: 60,
    
    // Stepper motor resolution (mm per one step)
    steplength: 0.2,

    // The distance between the edge of the world and the middle of the suspension boxes. 
    // For the simulator only
    suspensionMargin: cm(3),    
    
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