import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'roles.json');

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
    const roles = JSON.parse(fileData);

    const roleIndex = roles.findIndex((g: any) => g.id === id);
    if (roleIndex === -1) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    const updatedRole = {
      ...roles[roleIndex],
      active
    };
    roles[roleIndex] = updatedRole;

   await fs.writeFile(DATA_FILE_PATH, JSON.stringify(roles, null, 2));

    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error('Error updating role status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}