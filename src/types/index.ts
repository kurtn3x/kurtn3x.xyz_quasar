import { CancelTokenSource } from 'axios';

// this file includes all types used

// Types for Files/ Folders
export interface FolderEntryType {
  id: string;
  name: string;
  created: string;
  modified: string;
  shared: boolean;
  shared_allow_all_read: boolean;
  shared_allow_all_write: boolean;
  shared_password_protected: boolean;
  path: string;
  type: string;
  size: number;
  mime: string;
  modified_iso: string;
  created_iso: string;
  size_bytes: number;
  // set on demand
  selected?: boolean;
  drag_over?: boolean;
}

export interface FileItemExtendedType {
  id: string;
  name: string;
  created: string;
  modified: string;
  path: string;
  type: string;
  size: string;
  mime: string;
  permissions: string;
  owner: string;
  ownerid: string;
  parentid: string;
}

export interface UploadProgressEntryType {
  name: string;
  typeIcon: string;
  status: string;
  statusColor: string;
  message: string;
  abort: CancelTokenSource;
  size: string;
  transferred: string;
  transferredPercent: number;
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
  id: string;
  name: string;
  path: string;
  children: AllAvailableFoldersType[];
}

export interface RawFolderContentType {
  id: string;
  name: string;
  modified: string;
  created: string;
  shared_allow_all_read: boolean;
  shared_allow_all_write: boolean;
  shared_password_protected: boolean;
  shared: boolean;
  parentid: string;
  path: string;
  type: string;
  children: FolderEntryType[];
}

// Account / Profile Types
export interface AccountSettingsType {
  profile: UserProfileType;
  account: AccountType;
}

export interface AccountType {
  id: string;
  username: string;
  is_admin: boolean;
  email: string;
}

// Profile Data, used when showing a profile
export interface UserProfileType {
  role: string;
  username: string;
  name: string;
  date_joined: string;
  description: string;
  location: string;
  status: string;
  avatar: string;
  id: string;
}

export interface HeaderInformationType {
  username: string;
  is_admin: boolean;
  avatar: string;
}

// VPN

export interface VPNSetupInputType {
  publicKey: string;
  name: string;
}

export interface VPNSetupConnectionType {
  name: string;
  addresses: string;
  clientKey: string;
  serverKey: string;
  presharedKey: string;
  dnsServer: string;
  allowedIPs: string;
  endpoint: string;
  privateKey: string;
}

export interface VPNClientInfoType {
  name: string;
  addresses: string;
  client_publickey: string;
  id: string;
  created: string;
}
