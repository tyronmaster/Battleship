export default function isGameFinished(array) {
    const arrToTest = array.flat();
    return !arrToTest.find(item => item === 1);
}