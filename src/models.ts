export interface User {
  fetched: boolean;
  username: string;
  email: string;
  id: number;
  first_name: string;
  last_name: string;
  bio: string;
  phone: string;
  avatar: string;
  background: string;
}

export function defaultUser() {
  const user: User = {
    fetched: false,
    username: 'User',
    email: 'Email',
    id: 0,
    first_name: 'FirstName',
    last_name: 'LastName',
    bio: 'Hi, this is my bio.',
    phone: '0',
    avatar: 'https://media.kurtn3x.xyz/default.png',
    background: 'https://media.kurtn3x.xyz/background.png',
  };

  return user;
}

export function serializeUser(fetchedData: any) {
  const user: User = {
    fetched: true,
    username: fetchedData.username,
    email: fetchedData.email,
    id: fetchedData.profile.id,
    first_name: fetchedData.profile.first_name,
    last_name: fetchedData.profile.last_name,
    bio: fetchedData.profile.bio,
    phone: fetchedData.profile.phone,
    avatar: path_to_link(fetchedData.profile.avatar),
    background: path_to_link(fetchedData.profile.background),
  };
  return user;
}

function path_to_link(path: string) {
  const temp = path.split('/');
  const link =
    'https://media.kurtn3x.xyz/' + temp[2] + '/' + temp[3] + '/' + temp[4];
  return link;
}
