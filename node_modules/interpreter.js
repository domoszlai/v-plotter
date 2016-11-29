
// coordinates and resolution are in mm
// resolution is the minimal head movement bee line
function interpreter(gcodes, resolution, drawz = 0, currentX = 0, currentY = 0, currentZ = 0) {
    
    this.points = [];
        
    this.isInch = false;;
    this.isAbsolute = true;
    
    this.toPoints = function(){
        
        this.points = [];
    
        for(var i=0; i<gcodes.length; i++)
        {
            var gcode = gcodes[i];
            
            switch(gcode.type)
            {
                // plane selection. ignore it
                case 'G17':
                case 'G18':
                case 'G19':
                    break;
                case 'G90':
                    this.isAbsolute = true;
                    break;
                case 'G91':
                    this.isAbsolute = false;
                    break;
                case 'G20':
                    this.isInch = true;
                    break;
                case 'G21':
                    this.isInch = false;
                    break;
                case 'G0':
                case 'G1':
                    var newX = typeof gcode.args.X !== 'undefined' ? this.updateCoordinate(currentX, this.toMM(gcode.args.X)) : currentX;
                    var newY = typeof gcode.args.Y !== 'undefined' ? this.updateCoordinate(currentY, this.toMM(gcode.args.Y)) : currentY;
                    var newZ = typeof gcode.args.Z !== 'undefined' ? this.updateCoordinate(currentZ, this.toMM(gcode.args.Z)) : currentZ;
                    
                    // we draw only if both at the source and target coordinates touch the canvas
                    var drawing = currentZ <= drawz && newZ <= drawz;
                    
                    this.lineTo(newX, newY, drawing);
                    currentZ = newZ;
                    break;
                case 'G2':
                case 'G3':
                    
                    var cw = gcode.type == 'G2';
                    
                    // X,Y,I and J are obligatory
                    
                    var newX = this.updateCoordinate(currentX, this.toMM(gcode.args.X));
                    var newY = this.updateCoordinate(currentY, this.toMM(gcode.args.Y));
                    var newZ = typeof gcode.args.Z !== 'undefined' ? this.updateCoordinate(currentZ, this.toMM(gcode.args.Z)) : currentZ;                    
                    var cx = currentX + this.toMM(gcode.args.I);
                    var cy = currentY + this.toMM(gcode.args.J);

                    // we draw only if both at the source and target coordinates touch the canvas
                    var drawing = currentZ <= drawz && newZ <= drawz;
                    
                    this.arcTo(newX, newY, cx, cy, cw, drawing);
                    currentZ = newZ;
                    break;
                default:
                    // ignore everything else
                    break;
            }
        }
        
        return this.points;
    }

    this.lineTo = function(x2, y2, drawing)
    {
        var x1 = currentX;
        var y1 = currentY;
        
        if(x1==x2 && y1==y2) return;

        // length of the line
        var l = Math.sqrt(Math.pow(x2 - x1,2) + Math.pow(y2 - y1,2));
        // the number of splits needed according to resolution
        var ns = Math.ceil(l / resolution);
      
        if(x1 == x2)
        {
            var dy = (y2 - y1) / ns;
            var x = x1;
            var y = y1;
         
            for(var i=0; i<ns; i++)
            {
                y += dy;
                                
                this.points.push({x: x, y: y, drawing: drawing});
            }     
        }
        else
        {
            var m = (y2 - y1) / (x2 - x1);
            var b = - x1 * m + y1;
              
            var dx = (x2 - x1) / ns;

            var x = x1;
            
            for(var i=0; i<ns; i++)
            {
                x += dx;                
                var y = m * x + b;
                
                this.points.push({x: x, y: y, drawing: drawing});                
            }
        }

        currentX = x2;
        currentY = y2;
    }        
        
    this.arcTo = function(x2, y2, cx, cy, cw, drawing)
    {
        var x1 = currentX;
        var y1 = currentY;
        
        // radius of the circle
        var r = Math.sqrt(Math.pow(cx-x1, 2) + Math.pow(cy-y1, 2));
                
        // calculate angles
        var angle1 = this.calcAngle(cx, cy, x1, y1);
        var angle2 = this.calcAngle(cx, cy, x2, y2);
        
        if(angle2 == 0) angle2 = Math.PI * 2;

        var sweepAngle = Math.abs(angle2 - angle1);

        // angle of the arc
        if (!cw && angle2 < angle1)
        {
            sweepAngle = Math.PI * 2 - sweepAngle;
        }
        else if (cw && angle2 > angle1)
        {
            sweepAngle = Math.PI * 2 - sweepAngle;
        }
                
        // length of the arc
        var l = r * sweepAngle;
        
        // the number of splits needed according to resolution
        var ns = Math.ceil(l / resolution);
        
        // angle step
        var dangle = sweepAngle / ns;
        if(cw) dangle *= -1;
        
        // Current angle
        var cangle = angle1;
        
        for(var i=0; i<ns; i++)
        {
            cangle += dangle;
            
            var x = cx + r * Math.cos(cangle);                
            var y = cy + r * Math.sin(cangle);
            
            this.points.push({x: x, y: y, drawing: drawing});                
        }
        
        currentX = x2;
        currentY = y2;
    }    
      
    this.calcAngle = function(x1,y1,x2,y2)
    {
        var dx = x2 - x1;
        var dy = y2 - y1;
        
        var angle = Math.atan2(dy, dx);
        if(angle<0) angle += Math.PI * 2;
        
        return angle;
    }
      
    this.updateCoordinate = function(c, newc)
    {
        if(this.isAbsolute)
        {
            return newc;
        }
        else
        {
            return c + newc;
        }
    }

    this.toMM = function(d){
        if(this.isInch)
        {
            return d*2.54;
        }
        else
        {
            return d;    
        }
    }
}

if (typeof module !== 'undefined' && module.exports) 
{
	exports.interpreter = interpreter;
}
