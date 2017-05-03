function angleBetween2Lines(line1, line2)
{
    var angle1 = Math.atan2(line1.p1.y - line1.p2.y, line1.p1.x - line1.p2.x);
    var angle2 = Math.atan2(line2.p1.y - line2.p2.y, line2.p1.x - line2.p2.x);
    return angle1-angle2;
}   

function rotatePoint(point, origin, angle) 
{
    angle = Math.toRadians(angle);
    var x = Math.cos(angle) * (point.x-origin.x) - Math.sin(angle) * (point.y-origin.y) + origin.x;
    var y = Math.sin(angle) * (point.x-origin.x) + Math.cos(angle) * (point.y-origin.y) + origin.y;
    return {x: x, y: y};
}    

Math.toDegrees = function(radians) {
  return radians * 180 / Math.PI;
}

Math.toRadians = function(degrees) {
  return degrees * Math.PI / 180;
}

function transformation(config) {

    function lengthLeft(x,y)
    {
        x += config.E-config.suspensionMargin;
        y += config.F-config.suspensionMargin;
        return Math.sqrt((x*x) + (y*y));
    }

    function lengthRight(x,y)
    {
        x += config.E-config.suspensionMargin;
        y += config.F-config.suspensionMargin;
        return Math.sqrt(((config.D-x)*(config.D-x)) + (y*y));
    }

    var pA = {x: 0, y: 0};
    var pB = {x: config.A+config.B, y: 0};
    var pC = {x: config.A, y: config.C};
    
    var lAB = {p1: pA, p2: pB};
    var lAC = {p1: pA, p2: pC};
    var lBC = {p1: pB, p2: pC};
    
    var aABAC = angleBetween2Lines(lAB, lAC);
    var aABBC = angleBetween2Lines(lAB, lBC);
    var aACBC = angleBetween2Lines(lAC, lBC);
    
    var a1 = 360 - Math.toDegrees(aABAC);
    var a2 = 180 - Math.toDegrees(aABBC);
    
    //var a3 = Math.toDegrees(aACBC);
    //assert(Math.abs(a1)+Math.abs(a2)+Math.abs(a3)==180)

    this.calcLengths = function(penX, penY)
    {
        var t = config.D == 0 ? -1 : (penX - (config.D/2)) / (config.D/2); // relative position [-1..1]
        // r : relative position corrected with maximal angles
        
        if(t <= 0)
        {
            var r = -t * a1;
        }
        else
        {
            var r = t * a2;
        }
        
        var pPen = {x: penX, y: penY};
        var pA = {x: penX-config.A, y: penY-config.C};
        var pB = {x: penX+config.B, y: penY-config.C};
                
        var pLeft = rotatePoint(pA, pPen, r);
        var pRight = rotatePoint(pB, pPen, r);
     
        return {lLeft: lengthLeft(pLeft.x, pLeft.y), lRight: lengthRight(pRight.x, pRight.y)};
    }
    
    return this;
}

if (typeof module !== 'undefined' && module.exports) 
{
	exports.transformation = transformation;
}
