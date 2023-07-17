export default function isUserValid(userName, password, usersDatabase) {
    if ((userName.length < 5) || (password.length < 5))
        return { error: true, errorText: 'length of username or passord less then 5 symbols', };

    if (usersDatabase.find(user => user.name === userName))
        return { error: true, errorText: 'User already exists', }

    return { error: false, errorText: '', };

}