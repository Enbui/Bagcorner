const { model } = require("mongoose");

module.exports = function BreakDown (str) {
    str = String(str);
    str = str.replace(new RegExp('\r\n', 'g'), '\n');
    str = str.split('\n\n');
    str = str.map(p => `<p>${p}</p>`);
    str= str.join('');
    str = str .replace(new RegExp('\n', 'g'), '<br>');
    return str;      
}