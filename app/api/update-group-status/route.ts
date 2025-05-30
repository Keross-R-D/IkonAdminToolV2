import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface Group {
  id: string;
  name: string;
  description?: string;
  softwareId: string;
  active?: boolean;
}

interface FileData {
  groups: Group[];
}

interface StructureItem {
  name: string;
  path: string;
}

const structurePath = path.join(process.cwd(), 'public/folderStructure.json');
let DATA_FILE_PATH: string = '';

export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const { id, active } = await request.json();

    if (!id || typeof active !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body - id and active (boolean) are required' },
        { status: 400 }
      );
    }

    // Load the data file path from folder structure
    const structure: StructureItem[] = JSON.parse(await fs.readFile(structurePath, 'utf8'));
    const projectFile = structure.find(item => item.name === 'project.json');
    
    if (!projectFile) {
      return NextResponse.json(
        { error: 'project.json not found in folder structure' },
        { status: 500 }
      );
    }

    DATA_FILE_PATH = projectFile.path;
    console.log('Data file path:', DATA_FILE_PATH);

    const fileData: FileData = JSON.parse(await fs.readFile(DATA_FILE_PATH, 'utf8'));
    const groups = fileData.groups || [];

    const groupIndex = groups.findIndex(g => g.id === id);
    if (groupIndex === -1) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    const updatedGroup: Group = {
      ...groups[groupIndex],
      active
    };
    groups[groupIndex] = updatedGroup;

     fileData.groups = groups;
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(fileData, null, 2));

    return NextResponse.json(updatedGroup);
  } catch (error: unknown) {
    console.error('Error updating group status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}