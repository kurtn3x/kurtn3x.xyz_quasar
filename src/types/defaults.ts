import * as types from 'src/types/index';

export function defaultUser() {
  const user: types.UserProfileType = {
    role: 'User',
    username: 'WWWWWWWWWWWWWWWW',
    name: 'Lorem ipsum dolor sit amet, consetetur',
    status: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
    description:
      'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore',
    location: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
    date_joined: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
    avatar: 'https://media.kurtn3x.xyz/Users/kurt/avatar.png',
    id: '',
  };

  return user;
}

export function defaultHeaderInformation() {
  const info: types.HeaderInformationType = {
    username: 'Anon',
    is_admin: false,
    avatar: 'https://media.kurtn3x.xyz/default.png',
  };
  return info;
}

export function defaultAccountSettings() {
  const user: types.AccountSettingsType = {
    profile: {
      username: '',
      name: '',
      status: '',
      location: '',
      description: '',
      avatar: 'https://media.kurtn3x.xyz/default.png',
      role: '',
      date_joined: '',
      id: '',
    },
    account: {
      id: '',
      username: '',
      is_admin: false,
      email: '',
    },
  };

  return user;
}
