export default function attackTest(x, y, array) {
    if (!(array[y][x] === 1)) return { status: 'missed', array };

    array[y][x] = '*';
    const maxValue = 9;
    // console.log(array.flat());

    let fromX, fromY, toX, toY;
    if (x === 0) { fromX = 0; toX = x + 1; }
    if (x === maxValue) { fromX = x - 1; toX = maxValue; }
    if (y === 0) { fromY = 0; toY = y + 1; }
    if (y === maxValue) { fromY = y - 1; toY = maxValue; }

    for (let i = fromY; i <= toY; i++) {
        for (let j = fromX; j <= toX; j++) {
            // console.log('x', j, 'y', i, 'arr', array[j][i]);

            if (array[j][i] === 1) return { status: 'shot', array };
        }
    }

    return { status: 'killed', array };
}