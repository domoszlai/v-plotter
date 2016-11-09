function parseGCode(text)
{
	var gcodes = new Queue();	

	text = trimAll(text);
	
	var newLine = false;
	var gcode;
	var n = -1;
	
	while(text.length > 0)
	{
		var code = text.charAt(0).toUpperCase();
		
		if(code == 'G')
		{
			var value = parseInt(text.substr(1));
			gcode = {args: {}, type: "G"+value};
			gcodes.enqueue(gcode);
			if(n != -1)
			{
				gcode.N = n;
				n = -1;
			}
		}
		else if(code == 'M')
		{
			var value = parseInt(text.substr(1));
			gcode = {args: {}, type: "M"+value};
			gcodes.enqueue(gcode);
			if(n != -1)
			{
				gcode.N = n;
				n = -1;
			}				
		}
		else if(code == 'N')
		{
			var value = parseInt(text.substr(1));
			n = value;
		}
		else if(code == ';')
		{
			text = skipToNewLine(text);
			continue;
		}
		else
		{
			// If a newline starts with no G, or M repaet the previous command
			if(newLine)
			{
				gcode = {args: {}, type: gcode.type};
				gcodes.enqueue(gcode);				
			}
		
			var value = parseFloat(text.substr(1));
			eval("gcode.args."+code+"="+value+";");		
		}
					
		text = skipToNextPart(text);
		newLine = isNewLine(text);			
		text = trimAll(text);
	}
	
	return gcodes;
}

function trimAll(str)
{
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function isNewLine(str)
{
	for(var i=0; i<str.length; i++)
	{
		var c = str.charAt(i);
		if(c == ' ') continue;
		if(c == '\n') return true;
		return false;
	}
	
	return false;
}

function isNumberChar(aChar)
{
	myCharCode = aChar.charCodeAt(0);

	if(((myCharCode > 47) && (myCharCode <  58)) || aChar == '.' || aChar == '-')
	{
		return true;
	}
	else
	{
		return false;
	}
}

// skip 1 char and all the number parts
function skipToNextPart(str)
{
	str = str.substr(1);
	for(var i=0; i<str.length; i++)
	{
		if(!isNumberChar(str.charAt(i)))
		{
			return str.substr(i);
		}
	}
	
	return "";
}

function skipToNewLine(str)
{
	for(var i=0; i<str.length; i++)
	{
		var c = str.charAt(i);
		if(c == '\n') return trimAll(str.substr(i));
	}
	
	return "";
}	
