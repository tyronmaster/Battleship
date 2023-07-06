export default function frontendMessageHandler(frontendMessage) {
  const message = JSON.parse(frontendMessage.toString());
  console.log(message);
  let name = '';

  switch (message.type) {
    case 'reg': {
      const data = JSON.parse(message.data);
      name = data.name
      console.log(data);
      response = JSON.stringify({
        type: message.type,
        data: JSON.stringify(
          {
            name,
            index: i,
            error: false,
            errorText: "no error",
          }),
        id: 0,
      });
    }
  }

  // console.log(JSON.parse(data).name);
  if (d.type === 'create_room') {
    response = JSON.stringify({
      type: "update_room",
      data: JSON.stringify(
        [{
          roomId: 1,
          roomUsers: [
            {
              name,
              index: i,
            }
          ]
        },]
      )
      ,
      id: 0,
    })
  }

}