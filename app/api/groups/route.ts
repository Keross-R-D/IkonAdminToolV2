import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'groups.json');

export async function GET() {
  try {
    const fileData = await fs.readFile(DATA_FILE_PATH, 'utf8');
    const groups = JSON.parse(fileData);
    
    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error reading groups file:', error);
    return NextResponse.json(
      { error: 'Failed to load groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const newGroup = await request.json();
    let groups = [];
    
     try {
      const fileData = await fs.readFile(DATA_FILE_PATH, 'utf8');
      groups = JSON.parse(fileData);
    } catch (error) {
      console.log('Creating new groups file');
    }

    if (newGroup.id) {
      const index = groups.findIndex((g: { id: any; }) => g.id === newGroup.id);
      if (index !== -1) {
        groups[index] = newGroup;
      } else {
        groups.push(newGroup);
      }
    } else {
      groups.push({ ...newGroup, id: Date.now().toString() });
    }

    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(groups, null, 2));
    
    return NextResponse.json({ success: true, data: groups });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save group data' },
      { status: 500 }
    );
  }
}