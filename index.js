import { httpServer } from "./src/http_server/index.js";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);


import WebSocket, { WebSocketServer } from 'ws';
import { TYPES } from './src/utils/consts.js'
import backendMessageSender from "./src/utils/sender.js";
import frontendMessageHandler from "./src/utils/handler.js";

const WS_PORT = 3000;

const server = new WebSocketServer({ port: WS_PORT }, () => {
  console.log(`websocket server starts on ${WS_PORT}`);
});

let i = 0;
let usersDb = [];
let roomDb = [];

server.on('connection', (ws) => {
  console.log(`user ${++i} connected`);
  const userIndex = i;

  ws.on('message', (message) => {
    let { type, data, id } = JSON.parse(message.toString());
    let bckResponseData = '';

    if (type === TYPES.REG) {
      const { name, password } = JSON.parse(data);
      const index = userIndex;
      const validator = (name.length >= 5 && password.length >= 5) ?
        { error: false, errorText: '', } : { error: true, errorText: 'length of username or passord less then 5 symbols', };

      if (!validator.error) {
        // server.clients[i] = ws;
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

      console.log(roomDb.length);
      if (roomDb.length > 0) {
        bckResponseData = JSON.stringify(roomDb);

        const response = {
          type: TYPES.UPDATE_ROOM,
          data: bckResponseData,
          id,
        }
        console.log('inside', response);
        server.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(response));
          }
        })
      }
    }

    if (type === TYPES.CREATE_ROOM) {
      // console.log('client index ', server.clients);
      // server.clients.forEach(client =>{
      //   console.log(client);
      // })
      const validateUserInRoom = roomDb.find(room =>
        room.roomUsers.find(user =>
          user.index === userIndex));

      // console.log('user', userIndex, ' is', validateUserInRoom);

      if (!validateUserInRoom) {
        type = TYPES.UPDATE_ROOM;
        const roomId = roomDb.length + 1;
        const currentUserIndex = usersDb.findIndex((user) => user.index === userIndex);
        const roomUsers = [{ name: usersDb[currentUserIndex].name, index: usersDb[currentUserIndex].index }];

        roomDb.push({ roomId, roomUsers });

        bckResponseData = JSON.stringify(roomDb);
      }

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

    // console.log('Rooms DB', roomDb);

  })
  ws.on('close', () => {
    console.log(`user ${i} leaved a game`);

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
