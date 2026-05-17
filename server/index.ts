import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));

// ES module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const useS3 = process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_ACCESS_KEY_ID !== 'your-aws-access-key-id' &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_SECRET_ACCESS_KEY !== 'your-aws-secret-access-key';

let s3Client: S3Client | null = null;
const bucketName = process.env.AWS_S3_BUCKET || 'walform-storage';

// Local storage fallback directory
const localStorageDir = path.join(__dirname, 'storage');
if (!useS3) {
  console.log('⚠️ AWS S3 credentials not configured. Falling back to local file storage at:', localStorageDir);
  if (!fs.existsSync(localStorageDir)) {
    fs.mkdirSync(localStorageDir, { recursive: true });
  }
} else {
  console.log('🚀 AWS S3 integration enabled. Region:', process.env.AWS_REGION || 'us-east-1');
  s3Client = new S3Client({
    endpoint: process.env.AWS_S3_ENDPOINT || 'https://s3.ap-south-1.amazonaws.com',
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
  });
}

// Upload endpoint
app.post('/api/upload', async (req, res) => {
  try {
    const blobId = uuidv4();
    let bodyData: Buffer;

    if (Buffer.isBuffer(req.body)) {
      bodyData = req.body;
    } else if (typeof req.body === 'object') {
      bodyData = Buffer.from(JSON.stringify(req.body));
    } else {
      bodyData = Buffer.from(String(req.body));
    }

    if (useS3 && s3Client) {
      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: blobId,
        Body: bodyData,
        ContentType: 'application/json',
      }));
    } else {
      fs.writeFileSync(path.join(localStorageDir, blobId), bodyData);
    }

    res.json({ blobId });
  } catch (error: any) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Get endpoint
app.get('/api/blob/:blobId', async (req, res) => {
  try {
    const { blobId } = req.params;

    if (useS3 && s3Client) {
      const response = await s3Client.send(new GetObjectCommand({
        Bucket: bucketName,
        Key: blobId,
      }));
      const str = await response.Body?.transformToString();
      res.set('Content-Type', 'application/json');
      res.send(str);
    } else {
      const filePath = path.join(localStorageDir, blobId);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Blob not found' });
      }
      const data = fs.readFileSync(filePath);
      res.set('Content-Type', 'application/json');
      res.send(data);
    }
  } catch (error: any) {
    if (error.name === 'NoSuchKey' || error.Code === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return res.status(404).json({ error: 'Blob not found' });
    }
    console.error('Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch blob' });
  }
});

// Update endpoint
app.put('/api/blob/:blobId', async (req, res) => {
  try {
    const { blobId } = req.params;
    let bodyData: Buffer;

    if (Buffer.isBuffer(req.body)) {
      bodyData = req.body;
    } else if (typeof req.body === 'object') {
      bodyData = Buffer.from(JSON.stringify(req.body));
    } else {
      bodyData = Buffer.from(String(req.body));
    }

    if (useS3 && s3Client) {
      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: blobId,
        Body: bodyData,
        ContentType: 'application/json',
      }));
    } else {
      fs.writeFileSync(path.join(localStorageDir, blobId), bodyData);
    }

    res.json({ success: true, blobId });
  } catch (error: any) {
    console.error('Update Error:', error);
    res.status(500).json({ error: 'Update failed', details: error.message });
  }
});

// Delete endpoint
app.delete('/api/blob/:blobId', async (req, res) => {
  try {
    const { blobId } = req.params;

    if (useS3 && s3Client) {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: blobId,
      }));
    } else {
      const filePath = path.join(localStorageDir, blobId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete Error:', error);
    res.status(500).json({ error: 'Delete failed', details: error.message });
  }
});

// Submit form response endpoint (no wallet required)
app.post('/api/form/:formId/response', async (req, res) => {
  try {
    const { formId } = req.params;
    const responseId = uuidv4();
    const key = `response:${formId}:${responseId}`;
    
    let bodyData: Buffer;
    if (Buffer.isBuffer(req.body)) {
      bodyData = req.body;
    } else if (typeof req.body === 'object') {
      bodyData = Buffer.from(JSON.stringify(req.body));
    } else {
      bodyData = Buffer.from(String(req.body));
    }

    if (useS3 && s3Client) {
      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: bodyData,
        ContentType: 'application/json',
      }));
    } else {
      fs.writeFileSync(path.join(localStorageDir, key), bodyData);
    }

    res.json({ success: true, responseId });
  } catch (error: any) {
    console.error('Response Submission Error:', error);
    res.status(500).json({ error: 'Failed to submit response', details: error.message });
  }
});

// List responses for a form
app.get('/api/form/:formId/responses', async (req, res) => {
  try {
    const { formId } = req.params;
    const prefix = `response:${formId}:`;
    const responses: any[] = [];

    if (useS3 && s3Client) {
      const listRes = await s3Client.send(new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
      }));

      if (listRes.Contents) {
        for (const item of listRes.Contents) {
          if (item.Key) {
            const getRes = await s3Client.send(new GetObjectCommand({
              Bucket: bucketName,
              Key: item.Key,
            }));
            const content = await getRes.Body?.transformToString();
            if (content) {
              try {
                responses.push({
                  id: item.Key.split(':').pop(),
                  formId,
                  data: JSON.parse(content),
                  submittedAt: item.LastModified || new Date().toISOString(),
                });
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }
    } else {
      if (fs.existsSync(localStorageDir)) {
        const files = fs.readdirSync(localStorageDir);
        for (const file of files) {
          if (file.startsWith(prefix)) {
            const data = fs.readFileSync(path.join(localStorageDir, file), 'utf-8');
            try {
              responses.push({
                id: file.split(':').pop(),
                formId,
                data: JSON.parse(data),
                submittedAt: fs.statSync(path.join(localStorageDir, file)).mtime.toISOString(),
              });
            } catch (e) {
              // Ignore
            }
          }
        }
      }
    }

    res.json(responses);
  } catch (error: any) {
    console.error('Fetch Responses Error:', error);
    res.status(500).json({ error: 'Failed to fetch responses', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`S3 Proxy Backend running on port ${PORT}`);
});

export default app;
