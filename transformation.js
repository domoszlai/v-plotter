function angleBetween2Lines(line1, line2)
{
    var angle1 = Math.atan2(line1.p2.y - line1.p1.y, line1.p2.x - line1.p1.x);
    var angle2 = Math.atan2(line2.p2.y - line2.p1.y, line2.p2.x - line2.p1.x);
    return angle1-angle2;
}   

function rotatePoint(point, origin, radian) 
{    
    var x = Math.cos(radian) * (point.x-origin.x) - Math.sin(radian) * (point.y-origin.y) + origin.x;
    var y = Math.sin(radian) * (point.x-origin.x) + Math.cos(radian) * (point.y-origin.y) + origin.y;
    return {x: x, y: y};
}    

function crossProduct(u, v) {
    return u.x*v.y-u.y*v.x;
}

function distance(p1, p2)
{
    return Math.sqrt(Math.pow(p2.x-p1.x, 2)+Math.pow(p2.y-p1.y, 2));
}

function length(p)
{
    return distance(p, {x: 0, y: 0});
}

function createVector(p1, p2, length)
{
    var d = distance(p1, p2);
    var x = p1.x - p2.x;
    var y = p1.y - p2.y;
    return {x: x * length / d, y: y * length / d};
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
        return Math.sqrt((x*x) + (y*y));
    }

    function lengthRight(x,y)
    {
        return Math.sqrt(((config.D-x)*(config.D-x)) + (y*y));
    }

    function calcTorque(penX, penY, radian)
    {
        var pA = {x: -config.A, y: -config.C};
        var pB = {x: config.B, y: -config.C};
        var pC = {x: 0, y: 0};

        // Rotate than shift carriage coordinates        
        
        pA = rotatePoint(pA, pC, radian);
        pB = rotatePoint(pB, pC, radian);
        
        pA = {x: pA.x+penX, y: pA.y+penY};
        pB = {x: pB.x+penX, y: pB.y+penY};
        pC = {x: pC.x+penX, y: pC.y+penY};
        
        // Calculate initial string angles
        
        var alpha = angleBetween2Lines(
            {p1: {x: 0, y: 0}, p2: pA},
            {p1: {x: 0, y: 0}, p2: {x: pA.x, y: 0}});
        
        var beta = -angleBetween2Lines(
            {p1: {x: config.D, y: 0}, p2: pB},
            {p1: {x: config.D, y: 0}, p2: {x: pB.x, y: 0}});
        
        // Calculate tension in strings

        var T1 = Math.cos(beta)/Math.sin(alpha + beta);
        var T2 = Math.cos(alpha)/Math.sin(alpha + beta);
        
        // Calculate torque

        var vLevelArmA = {x: pA.x-pC.x, y: pA.y-pC.y};
        var vLevelArmB = {x: pB.x-pC.x, y: pB.y-pC.y};
        
        var vT1 = createVector({x: 0, y: 0}, pA, T1);
        var vT2 = createVector({x: config.D, y: 0}, pB, T2);
        
        var t1 = crossProduct(vLevelArmA, vT1);
        var t2 = crossProduct(vLevelArmB, vT2);
        
        return t1 + t2;
    }
    
    this.calcLengths = function(penX, penY)
    {
        penX += config.E;
        penY += config.F; 
        
        // Shortcut for specil case when the strings meet at one point
        if(config.A == 0 && config.B == 0)
        {
            pA = {x: penX, y: penY};
            pB = {x: penX, y: penY};
                  
            return {p1: pA, p2: pB, lLeft: lengthLeft(pA.x, pA.y), lRight: lengthRight(pB.x, pB.y)};            
        }
        
        // Otherwise: Newthon iteration to find the angle where the torque is zero
        
        var torque = Number.MAX_VALUE;
        var angle = 0;
        var eps = Math.toRadians(0.01);

        // Maximum error: 0.001
        while(Math.abs(torque) > 0.001)
        {
            torque = calcTorque(penX, penY, angle);
            var torqueEps = calcTorque(penX, penY, angle + eps);
            
            var deriv = (torqueEps - torque) / eps;            
            angle = angle - (torque/deriv);            
        }        
  
        var pA = {x: -config.A, y: -config.C};
        var pB = {x: config.B, y: -config.C};
        var pC = {x: 0, y: 0};

        // Rotate than shift carriage coordinates        
        
        pA = rotatePoint(pA, pC, angle);
        pB = rotatePoint(pB, pC, angle);
        
        pA = {x: pA.x+penX, y: pA.y+penY};
        pB = {x: pB.x+penX, y: pB.y+penY};
              
        return {p1: pA, p2: pB, lLeft: lengthLeft(pA.x, pA.y), lRight: lengthRight(pB.x, pB.y)};
    }
    
    return this;
}

if (typeof module !== 'undefined' && module.exports) 
{
	exports.transformation = transformation;
}
