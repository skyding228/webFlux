var fs = require("fs");

var dir = ".";
var SPLIT_LINE = '\r\n';
var REGEX_HEADER = /^ *(#+)(.+) *$/;
var REGEX_NUMBER = /^ *(?:\d+\.?)+/;

//set markdown file headers with number and add toc at the beginning
function toc(markdown,rootLevel=0,maxDepth=3) {
    var filename = markdown.substring(0,markdown.lastIndexOf('.'));
    var data = fs.readFileSync(markdown).toString();
    var lines = data.split(SPLIT_LINE);
    var newLines = [];
    var TOC = [], LEVEL_INDEX = [];
    LEVEL_INDEX[0]=rootLevel;
    lines.forEach(line => {
        newLines.push(line);
        var header = REGEX_HEADER.exec(line);
        if (header) {
            var level = header[1].length - 1; //get string which only contains #
            var text = header[2].trim();
            if (!LEVEL_INDEX[level]) {
                LEVEL_INDEX[level] = 1;
            } else {
                LEVEL_INDEX[level] += 1;
                //reset the lower levels
                for(var i=level+1;i<LEVEL_INDEX.length;i++){
                    LEVEL_INDEX[i] = 0;
                }
            }
            var number = getNumber(text) ;
            if(!number){
                number = LEVEL_INDEX.slice(0, level+1).join('.');
                text = number+' '+text;
            }
            newLines.splice(newLines.length-1,1,header[1] + ' '+ text);
            if(level + 1 > maxDepth){
                return;
            }
            var link = [];
            while (level -- >0){
                link.push('    '); //use 4 spaces to represent one level
            }
            link.push('* ['+text+']');
            link.push('('+filename+'#'+text2anchor(text)+')');
            TOC.push(link.join(''));
        }

    });
    fs.writeFileSync(markdown,newLines.join(SPLIT_LINE));
    return TOC;
}

/**
 * convert text to anchor
 * 1. use - to replace spaces
 * 2. use lowercase
 * 3. omit all not word character
 * @param text
 */
function text2anchor(text){
    return text.replace(/ +/g,'-').replace(/[/\.\?？@：:\(\)\\]+/g,'').toLowerCase();
}
//
function getNumber(text){
    var number = REGEX_NUMBER.exec(text);
    if(number){
        number = number[0];
    }
    return number;
}
console.log(toc('WebFlux.md',0).join(SPLIT_LINE));
console.log(toc('webClient.md',1).join(SPLIT_LINE));
console.log(toc('webSockets.md',2).join(SPLIT_LINE));