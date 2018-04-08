var fs = require("fs");

var dir = ".";
var SPLIT_LINE = '\r\n';
var REGEX_HEADER = /^ *(#+)(.+) *$/;

//set markdown file headers with number and add toc at the beginning
function toc(markdown,rootLevel=0,maxDepth=10) {
    var filename = markdown.substring(0,markdown.lastIndexOf('.'));
    var data = fs.readFileSync(markdown).toString();
    var lines = data.split(SPLIT_LINE);
    var TOC = [], LEVEL_INDEX = [];
    LEVEL_INDEX[0]=rootLevel;
    lines.forEach(line => {
        var header = REGEX_HEADER.exec(line);
        if (header) {
            var level = header[1].length - 1; //get string which only contains #
            if(level + 1 > maxDepth){
                return;
            }
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
            var number = LEVEL_INDEX.slice(0, level+1).join('.');
            var link = [];
            while (level -- >0){
                link.push('    '); //use 4 spaces to represent one level
            }
            link.push('* ['+number+' '+text+']');
            link.push('('+filename+'#'+text2anchor(text)+')');
            TOC.push(link.join(''));
        }
    });
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
    return text.replace(/ +/g,'-').replace(/[/\\?？@：:\\(\\)\\]+/g,'').toLowerCase();
}
console.log(toc('WebFlux.md',0,3).join(SPLIT_LINE));