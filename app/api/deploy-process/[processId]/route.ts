import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const structurePath = path.join(process.cwd(), "public/folderStructure.json");

export async function POST(req: Request, {params}: {params: {processId: string}}) {
    try {

        const {processId} = await params;
        const folderId = processId;
        const fileData = fs.readFileSync(structurePath, "utf-8");
        const structure = JSON.parse(fileData);

        let folderNode: any = null;

        function findFolder(nodes: any[], parent: any = null): boolean {
            for (const node of nodes) {
                if (node.id === folderId) {
                    folderNode = node;
                    return true;
                }
                if (node.children.length > 0) {
                    if (findFolder(node.children, node)) return true;
                }
            }
            return false;
        }

        if (!findFolder(structure)) {
            return NextResponse.json({ error: "Folder not found" }, { status: 400 });
        }

        const processFolderPath = folderNode.path;
        const processMetadataPath = path.join(processFolderPath,'metadata.json');

        const processMetadataJSON = fs.readFileSync(processMetadataPath,{ encoding: 'utf8' });
        const processMetadata = JSON.parse(processMetadataJSON);

        const {isDeployed} = processMetadata;
        if(!isDeployed) {

            processMetadata.isDeployed = true;
            const newProcessMetadataJSON = JSON.stringify(processMetadata,null,2)

            fs.writeFileSync(
                processMetadataPath,
                newProcessMetadataJSON
            )
        }        
        
        return NextResponse.json(
            {deployed: true}
        )
    }
    catch(err) {
        console.error("Failed to deploy the process");
        return NextResponse.json(
            {deployed: false}
        )
    }
}