import { CancelTokenSource } from 'axios';

export interface FolderEntryType {
  id: string;
  name: string;
  created: string;
  modified: string;
  shared: boolean;
  sharedAllowAllRead: boolean;
  sharedAllowAllWrite: boolean;
  sharedPasswordProtected: boolean;
  path: string;
  type: string;
  size: number;
  mime: string;
  modifiedTimeIso: string;
  createdTimeIso: string;
  sizeBytes: number;
  // set on demand
  owner?: string;
  selected?: boolean;
  dragOver?: boolean;
  rename?: boolean;
}

export interface SharedFileType {
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
  ownerId: string;
  parentId: string;
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
  parentId: number;
  folderId?: number;
}
// An Item in the UploadDialog,
export interface UploadDialogEntryType {
  name: string;
  type: string;
  content: File | FileSystemEntry;
  temp?: string;
  edit?: boolean;
  error?: boolean;
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
  type: string;
}

export interface RawFolderContentType {
  id: string;
  name: string;
  modified: string;
  created: string;
  sharedAllowAllRead: boolean;
  sharedAllowAllWrite: boolean;
  sharedPasswordProtected: boolean;
  shared: boolean;
  parentId: string;
  path: string;
  type: string;
  children: FolderEntryType[];
}

export interface AccountType {
  id: string;
  username: string;
  isAdmin: boolean;
  email: string;
}

// Profile Data, used when showing a profile
export interface UserProfileType {
  role: string;
  username: string;
  name: string;
  dateJoined: string;
  description: string;
  location: string;
  status: string;
  avatar: string;
  id: string;
}

export interface HeaderInformationType {
  username: string;
  isAdmin: boolean;
  avatar: string;
}

// VPN

export interface VPNSetupInputType {
  clientPublicKey: string;
  clientPrivateKey: string;
  name: string;
  autoKeyGeneration: boolean;
  alternativeRoute: boolean;
}

export interface VPNConnectionType {
  name: string;
  addresses: string;
  clientPublicKey: string;
  clientPrivateKey: string;
  serverPublicKey: string;
  presharedKey: string;
  dnsServers: string;
  allowedIps: string;
  allowedIpsInternal: string;
  endpoint: string;
}

export interface VPNInfoType {
  name: string;
  addresses: string;
  clientPublicKey: string;
  id: string;
  created: string;
  selected?: boolean;
}
