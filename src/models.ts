// preview, unused
export interface UserPreview {
  fetched: boolean;
  admin: string;
  username: string;
  status: string;
  avatar: string;
}

// Profile Data, used when showing a profile
export interface User {
  fetched: boolean;
  role: string;
  username: string;
  name: string;
  id: string;
  last_seen: string;
  date_joined: string;
  description: string;
  location: string;
  status: string;
  avatar: string;
}

// used to load data on the header
export interface HeaderInformation {
  fetched: boolean;
  username: string;
  admin: boolean;
  avatar: string;
}

export function defaultHeaderInformation() {
  const info: HeaderInformation = {
    fetched: false,
    username: 'User',
    admin: false,
    avatar: 'https://media.kurtn3x.xyz/default.png',
  };
  return info;
}

export function serializeHeaderInformation(fetchedData: any) {
  const info: HeaderInformation = {
    fetched: true,
    admin: fetchedData.is_admin,
    username: fetchedData.username,
    avatar: path_to_link_av(fetchedData.avatar),
  };
  return info;
}

export function defaultUser() {
  const user: User = {
    fetched: false,
    role: 'User',
    username: '',
    name: '',
    id: '',
    status: '',
    description: '',
    location: '',
    last_seen: '',
    date_joined: '',
    avatar: 'https://media.kurtn3x.xyz/default.png',
  };

  return user;
}

export function serializeUser(fetchedData: any) {
  let role = '';
  if (fetchedData.account.is_admin) {
    role = 'Admin';
  } else {
    role = 'User';
  }
  const user: User = {
    fetched: true,
    id: fetchedData.account.id,
    username: fetchedData.account.username,
    last_seen: fetchedData.account.last_seen,
    date_joined: fetchedData.account.date_joined,
    name: fetchedData.profile.name,
    status: fetchedData.profile.status,
    description: fetchedData.profile.description,
    location: fetchedData.profile.location,
    role: role,
    avatar: path_to_link_av(fetchedData.profile.avatar),
  };
  return user;
}

export function path_to_link_av(path: any) {
  if (path != null) {
    const temp = path.split('/');
    const link =
      'https://media.kurtn3x.xyz/' + temp[2] + '/' + temp[3] + '/' + temp[4];
    return link;
  } else {
    return 'https://media.kurtn3x.xyz/default.png';
  }
}
