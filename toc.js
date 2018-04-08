var fs = require("fs");

var dir = ".";
var SPLIT_LINE = '\r\n';
var REGEX_HEADER = /^ *(#+)(.+) *$/;

//set markdown file headers with number and add toc at the beginning
function toc(markdown,rootLevel=0) {
    var data = fs.readFileSync(markdown).toString();
    var lines = data.split(SPLIT_LINE);
    var TOC = [], LEVEL_INDEX = [];
    LEVEL_INDEX[0]=rootLevel;
    lines.forEach(line => {
        var header = REGEX_HEADER.exec(line);
        if (header) {
            var level = header[1].length - 1; //get string which only contains #
            var text = header[2];
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
            TOC.push(header[1] + ' '+ number + ' ' + text);
        }
    });
    return TOC;
}
console.log(toc('WebFlux.md').join(SPLIT_LINE));