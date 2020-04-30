const replaceAll = function (str, stringToFind, stringToReplace) {
    if (stringToFind === stringToReplace) return str;
    var temp = str;
    var index = temp.indexOf(stringToFind);
    while (index != -1) {
        temp = temp.replace(stringToFind, stringToReplace);
        index = temp.indexOf(stringToFind);
    }
    return temp;
};
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export {replaceAll, sleep}