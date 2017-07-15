var fs = require('fs');
var lineByLine = require('n-readlines');

var SerialPort = require('serialport');
var Delimiter = SerialPort.parsers.Delimiter;
var cobs = require('cobs');

var argv = require("argv");

var args = argv.option([
    {
        name: 'scan',
        short: 's',
        type: 'boolean'
    },
    {
        name: 'port',
        short: 'p',
        type: 'string'
    },
    {
        name: 'baud',
        short: 'b',
        type: 'int'
    },
    {
        name: 'help',
        short: 'h',
        type: 'boolean'
    }        
]).run();


if(args.options.detect)
{
    detect();
}
else if(args.targets.length == 1 && args.options.port)
{
    var br = 115200;
    if(args.options.baudrate) br = args.options.baudrate;
    
    main(args.targets[0], args.options.port, br);
}
else
{    
   console.info('Usage: sendsteps.js <stepfile> -p portname [options] \n\
\n\
        --help, -h \n\
                Displays help information about this script \n\
\n\
        --port portname, -p portname\n\
                Serial port to use \n\
\n\
        --baud baudrate, -b baudrate\n\
                 Baudrate. Default 115200 \n\
\n\
        --scan, -s \n\
                List available serial ports');
}

function detect()
{
    SerialPort.list(function (err, ports) {
        ports.forEach(function(port) {
            console.log(port.comName + " (" + port.manufacturer + ")");
        });
    });
}

var lineNumber = 0;

function sendFile(liner, port)
{
    function sendSteps(nrSteps) {
        for(var i=0; i<nrSteps; i++)
        {
            var line = liner.next();
            if(line)
            {
                lineNumber++;                
                console.log('Line ' + lineNumber + ': ' + line.toString('ascii'));
            
                var parts = line.toString().split(" ");
                var left_motor_steps = parseInt(parts[0]);
                var right_motor_steps = parseInt(parts[1]);
                var pen_on = parseInt(parts[2]);
            
                port.write(cobs.encode(new Buffer([left_motor_steps, right_motor_steps, pen_on])));
                port.write(new Buffer([0x00]));
            
                console.log('Send: ', new Buffer([left_motor_steps, right_motor_steps, pen_on]));
            }
            else
            {
                return console.log('Info: ', 'Step file has bben sent to the client');
            }
        }
    }

    var parser = port.pipe(new Delimiter({delimiter: new Buffer([0x00])}));
    parser.on('data', function (data) {
        var nrSteps = cobs.decode(data)[0];
        console.log('Steps requested: ', cobs.decode(data));
        sendSteps(nrSteps);
    });
}

function main(stepfile, portname, baudrate)
{    
    fs.open(stepfile, 'r', (err, fd) => {
        if (err) 
        {
            return console.log('Error: ', err.message);
        }
        else
        {
            var liner = new lineByLine(fd);

            var port = new SerialPort(portname, {
                    baudRate: baudrate,
                    autoOpen: false 
            });
                        
            port.open(function (err) {
                  if (err) {
                    return console.log('Error: ', err.message);
                  }
    
                  sendFile(liner, port);  
            });            
            
        }
    });
}
