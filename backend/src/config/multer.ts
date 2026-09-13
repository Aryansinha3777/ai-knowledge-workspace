import multer from 'multer';
import path from 'path';
import fs from 'fs';

const ALLOWED_TYPES = ['.pdf', '.txt', '.md'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const workspaceId = req.params.workspaceId;
    const dir = path.join(__dirname, '../../uploads', workspaceId);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

function fileFilter(req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_TYPES.includes(ext)) {
    return cb(new Error('Only PDF, TXT, and Markdown files are allowed'));
  }

  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});