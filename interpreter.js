
// coordinates are in mm
function interpreter(gcodes, drawz = 0, currentX = 0, currentY = 0, currentZ = 0) {
    
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
                    var newX = gcode.args.X ? this.updateCoordinate(currentX, this.toMM(gcode.args.X)) : currentX;
                    var newY = gcode.args.Y ? this.updateCoordinate(currentY, this.toMM(gcode.args.Y)) : currentY;
                    var newZ = gcode.args.Z ? this.updateCoordinate(currentZ, this.toMM(gcode.args.Z)) : currentZ;
                    
                    // we draw only if both the source and target coordinates touch the canvas
                    var drawing = currentZ <= drawz && newZ <= drawz;
                    
                    this.lineTo(newX, newY, drawing);
                    currentZ = newZ;
                    break;
                    
                default:
                    // ignore everything else
                    break;
            }
        }
        
        return this.points;
    }

    this.lineTo = function(x2, y2, drawing){
        
        var x1 = currentX;
        var y1 = currentY;
        
        if(x1==x2 && y1==y2) return;

        var l = Math.sqrt(((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)));
        var ns = Math.ceil(l / resolution);
      
        if(x1 == x2)
        {
            var dy = (y2 - y1) / ns;
            var x = x1;
            var y = y1;
         
            for(var i=0; i<ns; i++)
            {
                y += dy;
                                
                this.points.push({x: x-currentX, y: y-currentY, drawing: drawing});
                
                currentX = x;
                currentY = y;
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
                
                this.points.push({x: x-currentX, y: y-currentY, drawing: drawing});
                
                currentX = x;
                currentY = y;
            }
        }

        currentX = x2;
        currentY = y2;
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
            return mm(d*2.54);
        }
        else
        {
            return mm(d);    
        }
    }

}


