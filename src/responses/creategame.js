import { TYPES } from "../utils/consts.js";

export default function createGame(user, idGame) {
  const bckResponseData = JSON.stringify({
    idGame,
    idPlayer: user.index,
  });
  const response = {
    type: TYPES.CREATE_GAME,
    data: bckResponseData,
    id: 0,
  }
  return response;
}