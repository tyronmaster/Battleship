export default function attackTest(x, y, array) {
    if (array[x, y] === 1) array[x, y] = '*';
    const maxValue = array[0].length;

    let fromX, fromY, toX, toY;
    if (x === 0) { fromX = 0; toX = x + 1; }
    if (x === maxValue) { fromX = x - 1; toX = maxValue; }
    if (y === 0) { fromY = 0; toY = y + 1; }
    if (y === maxValue) { fromY = y - 1; toY = maxValue; }

    for (let i = fromX; i <= toX; i++) {
        for (let j = fromY; j <= toY; j++) {
            if (array[i, j] === 1) return { status: 'shot', array };
        }
    }

    return { status: 'killed', array };
}