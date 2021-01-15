
module.exports =  function ConvertTime(isoDate) {
    isoDate = new Date().toLocaleString(isoDate);
    return isoDate;
}