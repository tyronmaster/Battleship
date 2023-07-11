export default function isGameFinished(array) {
    return !array.find(item => item === 1);
}