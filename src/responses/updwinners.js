import { TYPES } from "../utils/consts.js";

export default function updateWinners(winnersDb) {
  const bckResponseData = JSON.stringify(winnersDb);
  const response = {
    type: TYPES.UPDATE_WINNERS,
    data: bckResponseData,
    id: 0,
  }
  return response;
}