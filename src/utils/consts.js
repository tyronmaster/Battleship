export const TYPES = {
    REG: 'reg', //player registration/login
    CREATE_ROOM: 'create_room', // on create_room we should update_room!!!
    ADD_USER_TO_ROOM: 'add_user_to_room', // on add user to room
    CREATE_GAME: 'create_game', // game id and enemy id
    ADD_SHIPS: 'add_ships',
    START_GAME: 'start_game', // informationa about game and player's ships positions
    TURN: 'turn', // who is shooting now
    ATTACK: 'attack', // coordinates of shot and status
    FINISH: 'finish', // id of the winner
    UPDATE_ROOM: 'update_room', // list of rooms and players in rooms
    UPDATE_WINNERS: 'update_winners', // send score table to players
}