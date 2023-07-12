import { httpServer } from "./src/http_server/index.js";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);


import WebSocket, { WebSocketServer } from 'ws';
import { TYPES } from './src/utils/consts.js';
import shipsPoolConverter from './src/utils/shipspoolconverter.js'
import backendMessageSender from "./src/utils/sender.js";
import frontendMessageHandler from "./src/utils/handler.js";
import attackTest from "./src/utils/attacktest.js";
import isGameFinished from "./src/utils/finishtest.js";

const WS_PORT = 3000;

const server = new WebSocketServer({ port: WS_PORT }, () => {
  console.log(`websocket server starts on ${WS_PORT}`);
});

let i = 0;
let usersDb = [];
let roomDb = [];
let gameDb = [];
let game = {};
let currentPlayer;
let currentGame;
let firstPlayer, secondPlayer;
let firstPlayerShips, secondPlayerShips;


server.on('connection', (ws) => {
  console.log(`user ${++i} connected`);
  const userIndex = i;
  server.clients[i] = ws;

  ws.on('message', (message) => {
    let { type, data, id } = JSON.parse(message.toString());
    let bckResponseData = '';

    if (type === TYPES.REG) {
      const { name, password } = JSON.parse(data);
      const index = userIndex;
      const validator = (name.length >= 5 && password.length >= 5) ?
        { error: false, errorText: '', } : { error: true, errorText: 'length of username or passord less then 5 symbols', };

      if (!validator.error) {
        const newUser = { name, password, index };
        usersDb.push(newUser);
      }

      bckResponseData = JSON.stringify(
        {
          name,
          index,
          error: validator.error,
          errorText: validator.errorText,
        }
      );

      const response = {
        type,
        data: bckResponseData,
        id,
      }

      ws.send(JSON.stringify(response));

      // console.log(roomDb.length);
      if (roomDb.length > 0) {
        bckResponseData = JSON.stringify(roomDb);

        const response = {
          type: TYPES.UPDATE_ROOM,
          data: bckResponseData,
          id,
        }
        // console.log('inside', response);
        server.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(response));
          }
        })
      }
    }

    if (type === TYPES.CREATE_ROOM) {

      /* roomDB = [ {
          roomId: number,
          roomUsers: [ {
            name,
            index
          } ]
        } ]
      */
      const validateUserInRoom = roomDb.find(room =>
        room.roomUsers.find(user =>
          user.index === userIndex));

      // if current user has no room we should create new room with him
      if (!validateUserInRoom) {
        type = TYPES.UPDATE_ROOM;
        const roomId = roomDb.length + 1;
        const currentUserIndex = usersDb.findIndex((user) => user.index === userIndex);
        const roomUsers = [{ name: usersDb[currentUserIndex].name, index: usersDb[currentUserIndex].index }];

        roomDb.push({ roomId, roomUsers });
      }

      bckResponseData = JSON.stringify(roomDb);
      const response = {
        type,
        data: bckResponseData,
        id,
      }

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
      roomDb[currentRoomIndex].roomUsers.push({
        name: usersDb.find(user => user.index === userIndex).name,
        index: userIndex,
      })
      // create game for both
      const idGame = gameDb.length + 1;

      roomDb[currentRoomIndex].roomUsers.forEach((user) => {
        const bckResponseData = JSON.stringify({
          idGame,
          idPlayer: user.index,
        });
        const response = {
          type: TYPES.CREATE_GAME,
          data: bckResponseData,
          id: 0,
        }
        if (server.clients[user.index].readyState === WebSocket.OPEN) {
          server.clients[user.index].send(JSON.stringify(response));
        }
      })

      // update rooms database deleting that room from base
      roomDb.splice(currentRoomIndex, 1);
      const bckResponseData = JSON.stringify(roomDb);

      const response = {
        type: TYPES.UPDATE_ROOM,
        data: bckResponseData,
        id: 0,
      }

      server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(response));
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

      // console.log('first player', firstPlayer, 'ships', Array.isArray(firstPlayerShips));
      // console.log('second player', secondPlayer, 'ships', Array.isArray(secondPlayerShips));

      // ======== start game for both players
      if (game[gameId].length === 2) {
        console.log(game, currentPlayer);
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
              const bckResponseData = JSON.stringify({ currentPlayer });
              const response = {
                type: TYPES.TURN,
                data: bckResponseData,
                id: 0,
              }
              server.clients[currentPlayer].send(JSON.stringify(response));
            }
          }
        })
      }
    }

    if (type === TYPES.ATTACK) {
      // check what Player make an attack. If not current - return
      const { gameId, x, y, indexPlayer } = JSON.parse(data);
      if (!(indexPlayer === currentPlayer)) return;



      // TODO
      // check if shot or killed or missed
      const testedArray = (currentPlayer === firstPlayer) ?
        secondPlayerShips : firstPlayerShips;
      // console.log(testedArray);
      const { status, array } = attackTest(x, y, testedArray);
      console.log('player ', currentPlayer, status);


      // send response ATTACK to second player
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
      server.clients[currentPlayer].send(JSON.stringify(response));

      // turn to another player
      if (status === 'missed') {
        currentPlayer = (currentPlayer === firstPlayer) ? secondPlayer : firstPlayer;
        const bckResponseData = JSON.stringify({ currentPlayer });
        const response = {
          type: TYPES.TURN,
          data: bckResponseData,
          id: 0,
        }
        server.clients[currentPlayer].send(JSON.stringify(response));
        return;
      }

      if (isGameFinished(array)) {
        console.log('finished');
        // send finish game
        let bckResponseData = JSON.stringify({ winPlayer: currentPlayer });
        let response = {
          type: TYPES.FINISH,
          data: bckResponseData,
          id: 0,
        }
        server.clients[currentPlayer].send(JSON.stringify(response));

        // updatewinner
        bckResponseData = JSON.stringify({ winPlayer: currentPlayer });
        response = {
          type: TYPES.UPDATE_WINNERS,
          data: bckResponseData,
          id: 0,
        }
        server.clients[currentPlayer].send(JSON.stringify(response));
        return;
      }

    }

    // if (currentGame) game[currentGame].forEach(game => console.log(game.ships));
    // console.log('Rooms DB', roomDb);

  })
  ws.on('close', () => {
    console.log(`user ${i} leaved a game`);

    // remove user's room if user close page
    const closedUserInRoom = roomDb.find(room =>
      room.roomUsers.find(user =>
        user.index === userIndex));

    if (closedUserInRoom) {
      const roomIndex = roomDb.indexOf(closedUserInRoom);
      roomDb.splice(roomIndex, 1);

      const bckResponseData = JSON.stringify(roomDb);

      const response = {
        type: TYPES.UPDATE_ROOM,
        data: bckResponseData,
        id: 0,
      }

      server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(response));
        }
      })
    }



  })

})
