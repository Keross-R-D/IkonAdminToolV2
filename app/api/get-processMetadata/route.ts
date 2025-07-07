// /app/api/get-processMetadata/route.ts

import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId');

    if (!folderId) {
      return new Response(JSON.stringify({ message: 'folderId is required' }), { status: 400 });
    }

    const baseDir = path.join(process.cwd(), "public/folderStructure.json");
    const file = fs.readFileSync(baseDir, 'utf-8');
    const folderStr = JSON.parse(file);

    function findFolder(folderId: string, folderStr: any): string {
      for (const node of folderStr) {
        if (node.id === folderId && node.type === "folder") {
          return node.path;
        }
        if (node.children.length > 0) {
          const result = findFolder(folderId, node.children);
          if (result) return result;
        }
      }
      return "";
    }

    const folderPath = findFolder(folderId, folderStr);

    if (!folderPath) {
      return new Response(JSON.stringify({ message: 'Folder not found' }), { status: 404 });
    }

    const metadataPath = path.join(folderPath, 'metadata.json');

    if (!fs.existsSync(metadataPath)) {
      return new Response(JSON.stringify({ message: 'Metadata file not found' }), { status: 404 });
    }

    const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataContent);

    return new Response(JSON.stringify({ metadata }), { status: 200 });
  } catch (error) {
    console.error('Error reading metadata:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}
