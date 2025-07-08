import { google } from 'googleapis';
import { Readable } from 'stream';

// Hàm upload file lên Google Drive (cũ)
export async function uploadFileToDrive({
  fileBuffer,
  fileName,
  mimeType,
  folderId,
}: {
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  folderId?: string;
}): Promise<string> {
  // Sử dụng credentials ở root project
  const auth = new google.auth.GoogleAuth({
    keyFile: './google-credentials.json',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata: any = {
    name: fileName,
  };
  if (folderId) fileMetadata.parents = [folderId];

  const media = {
    mimeType,
    body: Readable.from(fileBuffer),
  };

  const res = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id',
  });

  const fileId = res.data.id;
  if (!fileId) throw new Error('Upload failed');

  // Set file public (hoặc chỉnh quyền theo nhu cầu)
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  // Trả về link xem file
  return `https://drive.google.com/uc?id=${fileId}`;
}

// Hàm phụ trợ: tìm hoặc tạo folder theo tên và parentId
async function findOrCreateFolder(drive: any, name: string, parentId?: string): Promise<string> {
  // Tìm folder
  const q = [
    `name = '${name.replace("'", "\\'")}'`,
    "mimeType = 'application/vnd.google-apps.folder'",
    parentId ? `'${parentId}' in parents` : 'trashed = false',
  ].filter(Boolean).join(' and ');
  const res = await drive.files.list({
    q,
    fields: 'files(id, name)',
    spaces: 'drive',
  });
  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }
  // Tạo mới nếu chưa có
  const fileMetadata: any = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) fileMetadata.parents = [parentId];
  const folder = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id',
  });
  return folder.data.id!;
}

// Hàm upload báo cáo với logic folder và rename file
export async function uploadReportFileToDrive({
  fileBuffer,
  type,        // 'BCS' | 'BCC' | 'BCT'
  branch,      // 'GoVap' | 'TanPhu'
  date,        // Date object hoặc string yyyy-mm-dd
  mimeType,
}: {
  fileBuffer: Buffer;
  type: string;
  branch: string;
  date: Date | string;
  mimeType: string;
}): Promise<string> {
  const auth = new google.auth.GoogleAuth({
    keyFile: './google-credentials.json',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  const drive = google.drive({ version: 'v3', auth });

  // 1. Folder gốc "Báo cáo"
  const rootFolderId = await findOrCreateFolder(drive, 'Báo cáo');
  // 2. Folder chi nhánh
  const branchFolderId = await findOrCreateFolder(drive, branch, rootFolderId);
  // 3. Folder tháng
  const d = typeof date === 'string' ? new Date(date) : date;
  const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  const monthFolderId = await findOrCreateFolder(drive, monthStr, branchFolderId);

  // 4. Đặt tên file
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const fileName = `${type}_${day}${month}${year}.pdf`;

  // 5. Upload file
  const fileMetadata: any = {
    name: fileName,
    parents: [monthFolderId],
  };
  const media = {
    mimeType,
    body: Readable.from(fileBuffer),
  };
  const res = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id',
  });
  const fileId = res.data.id;
  if (!fileId) throw new Error('Upload failed');
  // Set file public
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  });
  return `https://drive.google.com/uc?id=${fileId}`;
} 