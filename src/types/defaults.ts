import * as types from 'src/types/index';

export function defaultUser() {
  const user: types.UserProfileType = {
    role: 'User',
    username: '',
    name: '',
    id: '',
    status: '',
    description: '',
    location: '',
    date_joined: '',
    avatar: 'https://media.kurtn3x.xyz/default.png',
  };

  return user;
}

export function defaultHeaderInformation() {
  const info: types.HeaderInformationType = {
    username: 'User',
    is_admin: false,
    avatar: 'https://media.kurtn3x.xyz/default.png',
  };
  return info;
}
