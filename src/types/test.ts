import {
  FolderEntryType,
  SharedFileType,
  UploadProgressEntryType,
  TraverseFolderMapType,
  UploadDialogEntryType,
  NavbarIndexType,
  AllAvailableFoldersType,
  RawFolderContentType,
  AccountType,
  UserProfileType,
  HeaderInformationType,
  VPNSetupInputType,
  VPNConnectionType,
  VPNInfoType,
} from './index';
import axios from 'axios';

// Default FolderEntry
export const defaultFolderEntry = (): FolderEntryType => ({
  id: '1',
  name: 'Sample File',
  created: new Date().toISOString(),
  modified: new Date().toISOString(),
  shared: false,
  sharedAllowAllRead: false,
  sharedAllowAllWrite: false,
  sharedPasswordProtected: false,
  path: '/home',
  type: 'file',
  size: 1024,
  mime: 'text/plain',
  modifiedTimeIso: new Date().toISOString(),
  createdTimeIso: new Date().toISOString(),
  sizeBytes: 1024,
  owner: 'testuser',
  selected: false,
  dragOver: false,
});

// Default SharedFile
export const defaultSharedFile = (): SharedFileType => ({
  id: '1',
  name: 'Shared Document',
  created: new Date().toISOString(),
  modified: new Date().toISOString(),
  path: '/shared/documents',
  type: 'file',
  size: '1024 KB',
  mime: 'application/pdf',
  permissions: 'read',
  owner: 'testuser',
  ownerId: 'usr_123',
  parentId: 'fld_parent',
});

// Default UploadProgressEntry
export const defaultUploadProgress = (): UploadProgressEntryType => ({
  name: 'document.pdf',
  typeIcon: 'description',
  status: 'uploading',
  statusColor: 'blue',
  message: 'Uploading...',
  abort: axios.CancelToken.source(),
  size: '1.2 MB',
  transferred: '600 KB',
  transferredPercent: 50,
});

// Default TraverseFolderMap
export const defaultTraverseFolderMap = (): TraverseFolderMapType => ({
  type: 'folder',
  id: 1,
  name: 'Documents',
  parentId: 0,
  folderId: 100,
});

// Default UploadDialogEntry
export const defaultUploadDialogEntry = (): UploadDialogEntryType => ({
  name: 'New Document.docx',
  type: 'file',
  content: new File([''], 'New Document.docx'),
  temp: 'tmp_123',
  edit: false,
  error: false,
});

// Default NavbarIndex
export const defaultNavbarIndex = (): NavbarIndexType => ({
  homeFolderId: 'root',
  navbarItems: [
    { name: 'Home', id: 'root' },
    { name: 'Documents', id: 'docs' },
  ],
  menuItems: [
    { name: 'New Folder', id: 'new_folder' },
    { name: 'Upload', id: 'upload' },
  ],
  lastMovedItemId: '',
});

// Default AllAvailableFolders
export const defaultAllAvailableFolders = (): AllAvailableFoldersType => ({
  id: 'root',
  name: 'Home',
  path: '/',
  type: 'folder',
  children: [
    {
      id: 'docs',
      name: 'Documents',
      path: '/documents',
      type: 'folder',
      children: [],
    },
    {
      id: 'pics',
      name: 'Pictures',
      path: '/pictures',
      type: 'folder',
      children: [],
    },
  ],
});

// Default RawFolderContent
export const defaultRawFolderContent = (): RawFolderContentType => ({
  id: 'folder1',
  name: 'Documents',
  modified: new Date().toISOString(),
  created: new Date().toISOString(),
  sharedAllowAllRead: false,
  sharedAllowAllWrite: false,
  sharedPasswordProtected: false,
  shared: false,
  parentId: 'root',
  path: '/documents',
  type: 'folder',
  children: [
    defaultFolderEntry(),
    {
      ...defaultFolderEntry(),
      id: '2',
      name: 'Second File',
      type: 'file',
    },
    {
      ...defaultFolderEntry(),
      id: '3',
      name: 'Subfolder',
      type: 'folder',
    },
  ],
});

// Default Account
export const defaultAccount = (): AccountType => ({
  id: 'usr_123',
  username: 'testuser',
  isAdmin: false,
  email: 'test@example.com',
});

// Default UserProfile
export const defaultUserProfile = (): UserProfileType => ({
  role: 'user',
  username: 'testuser',
  name: 'Test User',
  dateJoined: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  description: 'This is a test user account for development',
  location: 'Test City, Test Country',
  status: 'active',
  avatar: 'https://media.kurtn3x.xyz/default.png',
  id: 'usr_123',
});

// Default HeaderInformation
export const defaultHeaderInformation = (): HeaderInformationType => ({
  username: 'testuser',
  isAdmin: false,
  avatar: 'https://media.kurtn3x.xyz/default.png',
});

// Default VPNSetupInput
export const defaultVPNSetupInput = (): VPNSetupInputType => ({
  clientPublicKey: '',
  clientPrivateKey: '',
  name: 'My VPN',
  autoKeyGeneration: true,
  alternativeRoute: false,
});

// Default VPNConnection
export const defaultVPNConnection = (): VPNConnectionType => ({
  name: 'Main VPN',
  addresses: '10.0.0.2/24',
  clientPublicKey: 'CLIENT_PUBLIC_KEY_HERE',
  clientPrivateKey: 'CLIENT_PRIVATE_KEY_HERE',
  serverPublicKey: 'SERVER_PUBLIC_KEY_HERE',
  presharedKey: 'PRESHARED_KEY_HERE',
  dnsServers: '1.1.1.1, 8.8.8.8',
  allowedIps: '0.0.0.0/0',
  allowedIpsInternal: '10.0.0.0/24',
  endpoint: 'vpn.example.com:51820',
});

// Default VPNInfo
export const defaultVPNInfo = (): VPNInfoType => ({
  name: 'Main VPN',
  addresses: '10.0.0.2/24',
  clientPublicKey: 'CLIENT_PUBLIC_KEY_HERE',
  id: 'vpn_1',
  created: new Date().toISOString(),
  selected: false,
});

// Create array of multiple items for testing lists
export const createMockFolderEntries = (count = 5): FolderEntryType[] => {
  return Array(count)
    .fill(null)
    .map((_, index) => ({
      ...defaultFolderEntry(),
      id: `file_${index + 1}`,
      name: `Test File ${index + 1}`,
      type: index % 3 === 0 ? 'folder' : 'file',
      mime:
        index % 3 === 0
          ? 'folder'
          : `text/${index % 2 === 0 ? 'plain' : 'markdown'}`,
      size: 1024 * (index + 1),
      sizeBytes: 1024 * (index + 1),
    }));
};

// Create mock VPN connections for testing
export const createMockVPNInfoList = (count = 3): VPNInfoType[] => {
  return Array(count)
    .fill(null)
    .map((_, index) => ({
      ...defaultVPNInfo(),
      id: `vpn_${index + 1}`,
      name: `VPN Connection ${index + 1}`,
      addresses: `10.0.0.${index + 2}/24`,
      created: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(), // Each one day older
    }));
};

// Create a mock folder hierarchy for testing nested structures
export const createMockFolderHierarchy = (
  depth = 3,
  childrenPerLevel = 2
): AllAvailableFoldersType => {
  const createChildren = (
    currentDepth: number,
    parentPath: string
  ): AllAvailableFoldersType[] => {
    if (currentDepth <= 0) return [];

    return Array(childrenPerLevel)
      .fill(null)
      .map((_, index) => {
        const id = `folder_${parentPath}_${index}`;
        const name = `Folder ${parentPath}-${index}`;
        const path = `${parentPath}/${name}`;

        return {
          id,
          name,
          path,
          type: 'folder',
          children: createChildren(currentDepth - 1, path),
        };
      });
  };

  return {
    id: 'root',
    name: 'Root',
    path: '/',
    type: 'folder',
    children: createChildren(depth, ''),
  };
};
