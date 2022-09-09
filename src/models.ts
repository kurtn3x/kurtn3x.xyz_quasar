export interface Me {
  fetched: boolean;
  role: string;
  username: string;
  status: string;
  avatar: string;
}

export interface User {
  fetched: boolean;
  role: string;
  username: string;
  name: string;
  id: string;
  last_seen: string;
  joined: string;
  description: string;
  location: string;
  status: string;
  avatar: string;
  background: string;
  email: string;
}

export function defaultUser() {
  const user: User = {
    fetched: false,
    role: '​',
    username: '​',
    name: '​',
    id: '​',
    email: '​',
    status: '​',
    description: '​',
    location: '​',
    last_seen: '​',
    joined: '​',
    avatar: 'https://media.kurtn3x.xyz/default.png',
    background: 'https://media.kurtn3x.xyz/background.png',
  };

  return user;
}

export function defaultMe() {
  const user: Me = {
    fetched: false,
    role: '​',
    username: '​',
    status: '​',
    avatar: 'https://media.kurtn3x.xyz/default.png',
  };

  return user;
}

export function serializeMe(fetchedData: any) {
  const me: Me = {
    fetched: true,
    role: fetchedData.role,
    status: fetchedData.status,
    username: fetchedData.username,
    avatar: path_to_link_av(fetchedData.profile.avatar),
  };
  return me;
}

export function serializeUser(fetchedData: any) {
  const user: User = {
    fetched: true,
    role: fetchedData.role,
    username: fetchedData.username,
    email: fetchedData.email,
    id: fetchedData.id,
    name: fetchedData.profile.name,
    status: fetchedData.profile.status,
    description: fetchedData.profile.description,
    last_seen: fetchedData.profile.last_seen,
    joined: fetchedData.profile.joined,
    location: fetchedData.profile.location,
    avatar: path_to_link_av(fetchedData.profile.avatar),
    background: path_to_link_bg(fetchedData.profile.background),
  };
  return user;
}

function path_to_link_av(path: any) {
  if (path != null) {
    const temp = path.split('/');
    const link =
      'https://media.kurtn3x.xyz/' + temp[2] + '/' + temp[3] + '/' + temp[4];
    return link;
  } else {
    return 'https://media.kurtn3x.xyz/default.png';
  }
}

function path_to_link_bg(path: any) {
  if (path != null) {
    const temp = path.split('/');
    const link =
      'https://media.kurtn3x.xyz/' + temp[2] + '/' + temp[3] + '/' + temp[4];
    return link;
  } else {
    return 'https://media.kurtn3x.xyz/background.png';
  }
}
