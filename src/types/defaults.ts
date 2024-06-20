import * as types from 'src/types/index';

// for testing
export function defaultUser() {
  const user: types.UserProfileType = {
    role: 'User',
    username: 'Lorem ipsum',
    name: 'Lorem ipsum dolor sit amet, consetetur',
    status: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
    description:
      'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore',
    location: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
    dateJoined: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
    avatar: 'https://media.kurtn3x.xyz/default.png',
    id: '',
  };

  return user;
}

export function defaultHeaderInformation() {
  const info: types.HeaderInformationType = {
    username: 'username',
    isAdmin: false,
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
      dateJoined: '',
      id: '',
    },
    account: {
      id: '',
      username: '',
      isAdmin: false,
      email: '',
    },
  };

  return user;
}
