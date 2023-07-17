export default function addUserToRoom(userIndex, usersDb, roomDb) {
  const validateUserInRoom = roomDb.find(room =>
    room.roomUsers.find(user =>
      user.index === userIndex));

  // if current user has no room we should create new room with him
  if (!validateUserInRoom) {
    const roomId = userIndex;
    const currentUserIndex = usersDb.findIndex((user) =>
      user.index === userIndex);
    const roomUsers = [{
      name: usersDb[currentUserIndex].name,
      index: userIndex
    }];
    roomDb.push({ roomId, roomUsers });
  }
}