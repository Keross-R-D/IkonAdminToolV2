import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'roles.json');

export async function GET() {
  try {
    const fileData = await fs.readFile(DATA_FILE_PATH, 'utf8');
    const roles = JSON.parse(fileData);
    
    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error reading roles file:', error);
    return NextResponse.json(
      { error: 'Failed to load roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const newRole = await request.json();
    let roles = [];
    
     try {
      const fileData = await fs.readFile(DATA_FILE_PATH, 'utf8');
      roles = JSON.parse(fileData);
    } catch (error) {
      console.log('Creating new roles file');
    }

    if (newRole.id) {
      const index = roles.findIndex((g: { id: any; }) => g.id === newRole.id);
      if (index !== -1) {
        roles[index] = newRole;
      } else {
        roles.push(newRole);
      }
    } else {
      roles.push({ ...newRole, id: Date.now().toString() });
    }

    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(roles, null, 2));
    
    return NextResponse.json({ success: true, data: roles });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save role data' },
      { status: 500 }
    );
  }
}