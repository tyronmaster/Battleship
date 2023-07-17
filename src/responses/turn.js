import { TYPES } from "../utils/consts.js";

export default function turn(currentPlayer) {
    const bckResponseData = JSON.stringify({ currentPlayer });
    const response = {
        type: TYPES.TURN,
        data: bckResponseData,
        id: 0,
    }
    return response;
}