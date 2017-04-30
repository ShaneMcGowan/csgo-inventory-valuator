/** This is a description. */
function sanitiseArray(array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].type.includes('Stock')) {
            array.splice(i, 1)
            i--;
        }
    }
    return array;
}