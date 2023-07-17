import { TYPES } from "../utils/consts.js";

export default function finish(currentPlayer) {
    let bckResponseData = JSON.stringify({ winPlayer: currentPlayer });
    let response = {
        type: TYPES.FINISH,
        data: bckResponseData,
        id: 0,
    }
    return response;
}