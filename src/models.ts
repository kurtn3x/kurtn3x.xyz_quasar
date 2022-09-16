// preview, unused
export interface UserPreview {
  fetched: boolean;
  role: string;
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
  background: string;
}

// used to load data on the header
export interface HeaderInformation {
  fetched: boolean;
  username: string;
  role: string;
  status: string;
  last_seen: string;
  avatar: string;
}

export function defaultHeaderInformation() {
  const info: HeaderInformation = {
    fetched: false,
    username: '​',
    role: '​',
    status: '​',
    last_seen: '​',
    avatar: 'https://media.kurtn3x.xyz/default.png',
  };
  return info;
}

export function serializeHeaderInformation(fetchedData: any) {
  const info: HeaderInformation = {
    fetched: true,
    role: fetchedData.profile.role,
    status: fetchedData.profile.status,
    username: fetchedData.username,
    last_seen: fetchedData.profile.last_seen,
    avatar: path_to_link_av(fetchedData.profile.avatar),
  };
  return info;
}

export function defaultUser() {
  const user: User = {
    fetched: false,
    role: 'User',
    username: '​',
    name: '​',
    id: '​',
    status: '​',
    description: '​',
    location: 'Germany',
    last_seen: 'Never',
    date_joined: '​',
    avatar: 'https://media.kurtn3x.xyz/default.png',
    background: 'https://media.kurtn3x.xyz/background.png',
  };

  return user;
}

export function defaultUserPreview() {
  const user: UserPreview = {
    fetched: false,
    role: '​',
    username: '',
    status: '​',
    avatar: 'https://media.kurtn3x.xyz/default.png',
  };

  return user;
}

export function serializeUserPreview(fetchedData: any) {
  const user_preview: UserPreview = {
    fetched: true,
    role: fetchedData.role,
    status: fetchedData.status,
    username: fetchedData.username,
    avatar: path_to_link_av(fetchedData.profile.avatar),
  };
  return user_preview;
}

export function serializeUser(fetchedData: any) {
  const user: User = {
    fetched: true,
    id: fetchedData.account.id,
    username: fetchedData.account.username,
    last_seen: fetchedData.profile.last_seen,
    date_joined: fetchedData.account.date_joined,
    name: fetchedData.profile.name,
    status: fetchedData.profile.status,
    description: fetchedData.profile.description,
    location: fetchedData.profile.location,
    role: fetchedData.profile.role,
    avatar: path_to_link_av(fetchedData.profile.avatar),
    background: path_to_link_bg(fetchedData.profile.background),
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

export function path_to_link_bg(path: any) {
  if (path != null) {
    const temp = path.split('/');
    const link =
      'https://media.kurtn3x.xyz/' + temp[2] + '/' + temp[3] + '/' + temp[4];
    return link;
  } else {
    return 'https://media.kurtn3x.xyz/background.png';
  }
}
