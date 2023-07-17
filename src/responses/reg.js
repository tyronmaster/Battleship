import { TYPES } from "../utils/consts.js";
import isUserValid from "../utils/uservalidator.js";

export default function regResponse(data, userIndex, usersDb) {
  const type = TYPES.REG;

  const { name, password } = JSON.parse(data);
  const index = userIndex;

  const userValidation = isUserValid(name, password, usersDb);
  if (!userValidation.error) {
    const newUser = { name, password, index };
    usersDb.push(newUser);
  }

  const bckResponseData = JSON.stringify(
    {
      name,
      index,
      error: userValidation.error,
      errorText: userValidation.errorText,
    }
  );

  const response = {
    type,
    data: bckResponseData,
    id: 0,
  }

  return response;
}