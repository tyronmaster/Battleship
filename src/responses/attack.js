import { TYPES } from "../utils/consts.js";

export default function attack(currentPlayer, x, y, status) {
    const bckResponseData = JSON.stringify({
        position: { x, y },
        currentPlayer,
        status,
    });
    const response = {
        type: TYPES.ATTACK,
        data: bckResponseData,
        id: 0,
    }
    return response;
}