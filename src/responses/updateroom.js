import { TYPES } from "../utils/consts.js";

export default function updateRoom(roomDb) {
  const bckResponseData = JSON.stringify(roomDb);

  const response = {
    type: TYPES.UPDATE_ROOM,
    data: bckResponseData,
    id: 0,
  }

  return response;
}