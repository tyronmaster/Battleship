export default function isUserValid(userName, password, usersDatabase){
    if ((userName.length < 5) || (password.length < 5)) return false;

    if(usersDatabase.find(user => user.name === userName)) return false;

    return true;

}