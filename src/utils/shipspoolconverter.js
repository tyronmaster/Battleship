export default function shipsPoolConverter(array) {
    if (!array.length) return;

    const MAX_POOL_LENGTH = 10;
    const countOfCoords = array.length;

    const resultArray = new Array(MAX_POOL_LENGTH);
    for (let i = 0; i < MAX_POOL_LENGTH; i++) {
        resultArray[i] = new Array(MAX_POOL_LENGTH).fill(0);
    }

    for (let i = 0; i < countOfCoords; i++) {
        const x = array[i].position.x;
        const y = array[i].position.y;
        resultArray[x][y] = 1;
    }

    return resultArray;
}