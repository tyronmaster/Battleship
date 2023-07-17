import { httpServer } from "./src/http_server/index.js";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

// TODO
// refactor this shitcode as soon as possible
import WebSocket, { WebSocketServer } from 'ws';
import { TYPES } from './src/utils/consts.js';
import shipsPoolConverter from './src/utils/shipspoolconverter.js'
import attackTest from "./src/utils/attacktest.js";
import isGameFinished from "./src/utils/finishtest.js";
import isUserValid from "./src/utils/uservalidator.js";
import regResponse from "./src/responses/reg.js";
import updateRoom from "./src/responses/updateroom.js";
import addUserToRoom from "./src/utils/addusertoroom.js";
import createGame from "./src/responses/creategame.js";
import attack from "./src/responses/attack.js";
import turn from "./src/responses/turn.js";
import finish from "./src/responses/finish.js";
import updateWinners from "./src/responses/updwinners.js";

const WS_PORT = 3000;

const server = new WebSocketServer({ port: WS_PORT }, () => {
  console.log(`websocket server starts on ${WS_PORT}`);
});

let i = 0;
let usersDb = [];
let roomDb = [];
let gameDb = [];
let winnersDb = [];
let game = {};
let currentPlayer;
let currentGame;
let firstPlayer, secondPlayer;
let firstPlayerShips, secondPlayerShips;


server.on('connection', (ws) => {
  console.log(`user ${i} connected`);
  const userIndex = i;
  server.clients[i] = ws;

  ws.on('message', (message) => {
    let { type, data, id } = JSON.parse(message.toString());

    if (type === TYPES.REG) {
      const responseReg = regResponse(data, userIndex, usersDb);
      ws.send(JSON.stringify(responseReg));

      // update rooms view for user
      if (roomDb.length > 0) {
        const responseUpdRoom = updateRoom(roomDb);
        server.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(responseUpdRoom));
          }
        })
      }
    }

    if (type === TYPES.CREATE_ROOM) {
      addUserToRoom(userIndex, usersDb, roomDb);

      const response = updateRoom(roomDb);

      server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(response));
        }
      })
    }

    if (type === TYPES.ADD_USER_TO_ROOM) {
      const { indexRoom } = JSON.parse(data);

      // check if such room is in rooms database
      const currentRoomIndex = roomDb.findIndex(room =>
        room.roomId === indexRoom);
      if (currentRoomIndex < 0) return;

      // check if user already in the room
      const userAlreadyInRoomDb =
        roomDb[currentRoomIndex]
          .roomUsers.find(user =>
            user.index === userIndex);
      if (userAlreadyInRoomDb) return;

      // otherwise add new user to currentRoom in rooms database
      const newPlayerName = usersDb
        .find(user => user.index === userIndex)
        .name;
      roomDb[currentRoomIndex].roomUsers.push({
        name: newPlayerName,
        index: userIndex,
      })
      // create game for both
      const idGame = gameDb.length + 1;
      let usersInGame = [];

      roomDb[currentRoomIndex].roomUsers.forEach((user) => {
        const response = createGame(user, idGame);
        if (server.clients[user.index].readyState === WebSocket.OPEN) {
          server.clients[user.index].send(JSON.stringify(response));
        }
        usersInGame.push(user.index);
      })

      // update rooms database deleting rooms of both from base
      usersInGame.forEach(userId => {
        roomDb.splice(userId, 1);
        console.log(`Room ${userId} removed from base`);
      });

      const responseUpdRoom = updateRoom(roomDb);
      server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(responseUpdRoom));
        }
      })
    }

    if (type === TYPES.ADD_SHIPS) {
      // parse data from frontend and wait for 2 players in game
      const { gameId, ships, indexPlayer } = JSON.parse(data);
      if (game[gameId]) {
        game[gameId].push({ ships, currentPlayerIndex: indexPlayer });
        currentGame = gameId;
        secondPlayer = indexPlayer;
        secondPlayerShips = shipsPoolConverter(ships);
      }
      else {
        game[gameId] = [{ ships, currentPlayerIndex: indexPlayer }];
        currentPlayer = indexPlayer;
        firstPlayer = indexPlayer;
        firstPlayerShips = shipsPoolConverter(ships);
      }

      // ======== start game for both players
      if (game[gameId].length === 2) {
        game[gameId].forEach((gamer) => {
          const bckResponseData = JSON.stringify(gamer);
          const response = {
            type: TYPES.START_GAME,
            data: bckResponseData,
            id: 0,
          }
          const clientIndex = gamer.currentPlayerIndex;
          if (server.clients[clientIndex].readyState === WebSocket.OPEN) {
            server.clients[clientIndex].send(JSON.stringify(response));
            // ======== send TURN to player who set ships first
            if (clientIndex === currentPlayer) {
              const turnResponse = turn(currentPlayer);
              server.clients[currentPlayer].send(JSON.stringify(turnResponse));
            }
          }
        })
      }
    }

    if (type === TYPES.ATTACK) {
      // check what Player make an attack. If not current - return
      const { gameId, x, y, indexPlayer } = JSON.parse(data);
      if (!(indexPlayer === currentPlayer)) return;

      const testedArray = (currentPlayer === firstPlayer) ?
        secondPlayerShips : firstPlayerShips;
      const { status, array } = attackTest(x, y, testedArray);

      // send response ATTACK to player
      const attackResponse = attack(currentPlayer, x, y, status);
      server.clients[currentPlayer].send(JSON.stringify(attackResponse));

      // turn to another player
      if (status === 'missed') {
        currentPlayer = (currentPlayer === firstPlayer) ? secondPlayer : firstPlayer;
        const turnResponse = turn(currentPlayer);
        server.clients[currentPlayer].send(JSON.stringify(turnResponse));
        return;
      }

      if (isGameFinished(array)) {
        console.log(`Game finished with ${currentPlayer} wins`);
        // send finish game
        game[currentGame] = [];
        const finishResponse = finish(currentPlayer);
        server.clients[currentPlayer].send(JSON.stringify(finishResponse));

        // updatewinner
        console.log(winnersDb);
        const winnerData = usersDb.find(user =>
          user.index === currentPlayer);
        const winnerWins = winnersDb.find(winner =>
          winner.name === winnerData.name);
        if (winnerWins) {
          winnerWins.wins++;
        } else {
          const name = winnerData.name;
          const wins = 1;
          winnersDb.push({ name, wins });
        }
        const updWinnersResponse = updateWinners(currentPlayer);
        server.clients[currentPlayer].send(JSON.stringify(updWinnersResponse));
        return;
      }
    }
  })

  ws.on('close', () => {
    console.log(`user ${userIndex} leaved a game`);

    // remove user's room if user close page
    const closedUserInRoom = roomDb.find(room =>
      room.roomUsers.find(user =>
        user.index === userIndex));

    if (closedUserInRoom) {
      const roomIndex = roomDb.indexOf(closedUserInRoom);
      roomDb.splice(roomIndex, 1);

      const response = updateRoom(roomDb);

      server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(response));
        }
      })
    }

  })

  // increase websocket index
  i++;
})
