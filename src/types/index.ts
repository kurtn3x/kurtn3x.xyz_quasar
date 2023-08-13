import { CancelTokenSource, CancelTokenStatic } from 'axios';

// this file includes all types used

type MimeType = {
  icon: string;
  link: string;
};

const mimeMap: Map<string, MimeType> = new Map<string, MimeType>();

mimeMap.set('video/mp4', { icon: 'movie', link: 'video' });

export { mimeMap };

export interface NameIdType {
  name: string;
  id: string;
}

// a basic Item in a Folder, can be either an file or folder (type)
export interface FolderObjectType {
  // all folders & files have those values
  id: string;
  name: string;
  created: string;
  modified: string;
  shared: boolean;
  shared_allow_all_read: boolean;
  shared_allow_all_write: boolean;
  path: string;
  type: string;
  // file specific
  size?: number;
  mime?: string;
  // set on demand
  selected?: boolean;
  drag_over?: boolean;
}

// a progress item in the bottom right sticky
export interface UploadProgressEntryType {
  name: string;
  icon: string;
  color: string;
  status: string;
  error: string;
  abort: CancelTokenSource;
  size: string;
  transferred: string;
  transferredPercent: number;
  transferredPercentLabel: string;
}
export interface TraverseFolderMapType {
  type: string;
  id: number;
  name: string;
  entry?: FileSystemEntry;
  parent_id: number;
  folder_id?: number;
}
// An Item in the UploadDialog,
export interface UploadDialogEntryType {
  name: string;
  type: string;
  content: File | FileSystemEntry;
  temp?: string;
  edit?: boolean;
}

export interface NavbarIndexType {
  homeFolderId: string;
  navbarItems: { name: string; id: string }[];
  menuItems: { name: string; id: string }[];
  lastMovedItemId: string;
}

export interface AllAvailableFoldersType {
  homeFolderId: string;
  navbarItems: { name: string; id: string }[];
  menuItems: { name: string; id: string }[];
  lastMovedItemId: string;
}

export interface RawFolderContentType {
  id: string;
  name: string;
  modified: string;
  created: string;
  shared_allow_all_read: boolean;
  shared_allow_all_write: boolean;
  shared: boolean;
  parentid: string;
  path: string;
  type: string;
  children: FolderObjectType[];
}

export interface AccountSettingsType {
  profile: {
    name: string;
    status: string;
    location: string;
    description: string;
    avatar: string | null;
    date_joined: string;
  };
  account: {
    id: string;
    username: string;
    is_admin: boolean;
    email: string;
  };
}

// Profile Data, used when showing a profile
export interface UserProfileType {
  role: string;
  username: string;
  name: string;
  id: string;
  date_joined: string;
  description: string;
  location: string;
  status: string;
  avatar: string;
}

// used to load data on the header
export interface HeaderInformationType {
  username: string;
  is_admin: boolean;
  avatar: string;
}

export function getIcon(mime: string) {
  const t = mimeMap.get(mime);
  if (t == undefined) {
    return 'file_present';
  } else {
    return t.icon;
  }
}
