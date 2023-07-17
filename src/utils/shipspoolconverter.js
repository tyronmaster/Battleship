export default function shipsPoolConverter(array) {
    if (!array.length) return;

    const MAX_POOL_LENGTH = 10;
    const countOfCoords = array.length;

    const resultArray = new Array(MAX_POOL_LENGTH);
    for (let i = 0; i < MAX_POOL_LENGTH; i++) {
        resultArray[i] = new Array(MAX_POOL_LENGTH).fill(0);
    }

    for (let i = 0; i < countOfCoords; i++) {
        const width = array[i].length;
        const x = array[i].position.x;
        const y = array[i].position.y;

        // console.log('x ', x, 'y ', y, 'width ', width);
        // console.log('direction ',
            // array[i].direction === true ? 'down X' : 'left Y');

        for (let j = 0; j < width; j++) {
            if (array[i].direction === true) {
                resultArray[y + j][x] = 1;
            } else {
                resultArray[y][x + j] = 1;
            }
        }
    }
    // console.log(resultArray);
    // console.log(resultArray.flat(1));
    return resultArray;
}
