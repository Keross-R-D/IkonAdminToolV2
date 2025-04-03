import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'groups.json');

export async function PUT(request: Request) {
  try {
    const { id, active } = await request.json();

    if (!id || typeof active !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const fileData = await fs.readFile(DATA_FILE_PATH, 'utf8');
    const groups = JSON.parse(fileData);

    const groupIndex = groups.findIndex((g: any) => g.id === id);
    if (groupIndex === -1) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    const updatedGroup = {
      ...groups[groupIndex],
      active
    };
    groups[groupIndex] = updatedGroup;

   await fs.writeFile(DATA_FILE_PATH, JSON.stringify(groups, null, 2));

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error('Error updating group status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}