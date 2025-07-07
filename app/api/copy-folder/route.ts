import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import archiver from "archiver";
import { v4 as uuidv4 } from 'uuid';


interface FolderNode {
  id: string;
  name: string;
  type: "folder" | "file";
  path: string;
  children?: FolderNode[];
}


export const runtime = "nodejs";
const structurePath = path.join(process.cwd(), "public/folderStructure.json");
const fileData = await fs.readFile(structurePath, "utf-8");


export async function POST(req: Request) {
  try {
    const folderId  = await req.json();
    const structure = JSON.parse(fileData);

    let srcNode: FolderNode | null = null;
    for (const node of structure) {
          if (node.name === "src") {
            srcNode = node;
            break;
          }
    }


    const parentFolderPath = srcNode.path;
    let folderToCopy: any = null;
    let folderPath : string | null = null;

   async function findFolder(nodes: any[]): Promise<boolean> {
        for (const node of nodes) {
            if(node.id == folderId && node.type === "folder"){
                folderPath = node.path.replace("/children","");
                folderToCopy = {
                    name: node.name + "- Copy",
                    id: uuidv4(),
                    children: node.children, // children array always includes 'children' folder by design
                    type: node.type
                };
                return true;
            } else if (node.children.length > 0) {
                if (await findFolder(node.children)) return true;
            }
        }
        return false;
    }

    await findFolder(structure)



    const newFolderPath = path.join(parentFolderPath,folderToCopy.name + "_" + folderToCopy.id)

    try {
      await fs.access(newFolderPath);
      return NextResponse.json({ error: "Folder already exists!" }, { status: 400 });
    } catch {
      await fs.mkdir(newFolderPath, { recursive: true });
    }

    const subfolders = ["children", "instances", "scripts"];
        for (const subfolder of subfolders) {
          const subfolderPath = path.join(newFolderPath, subfolder);
          try {
            await fs.access(subfolderPath);
          } catch {
            await fs.mkdir(subfolderPath, { recursive: true });
          }
        }

        //copying all scripts
        const scriptFolderPath = path.join(folderPath, "scripts");
        const scriptMetadataPath =  path.join(scriptFolderPath, "metadata.json");

        try {
           
            await fs.access(scriptMetadataPath);
          } catch {
            return NextResponse.json({ error: "Script folder not found !" }, { status: 400 });
          }
        const scriptMetadata = JSON.parse(await fs.readFile(scriptMetadataPath, "utf-8"));

        let newScriptMetadeta = [];
        const copyScriptFolderPath = path.join(newFolderPath, 'scripts');
        let scriptIdMap = {};
        for(var i in scriptMetadata){
            const scriptId = uuidv4();
            newScriptMetadeta.push({
                "scriptId": scriptId,
                "scriptName": scriptMetadata[i].scriptName,
                "scriptType": scriptMetadata[i].scriptType,
                "scriptLanguage": scriptMetadata[i].scriptLanguage,
            })

            scriptIdMap[scriptMetadata[i].scriptId] = scriptId;
            const langType = scriptMetadata[i].scriptLanguage == "JavaScript" ? ".js" : scriptMetadata[i].scriptLanguage == "Python" ? ".py" : ".mjs"
            const scriptName = scriptMetadata[i].scriptName +"_"+scriptMetadata[i].scriptId + langType
            const newScriptName = scriptMetadata[i].scriptName +"_"+scriptId + langType

            const newScriptpath = path.join(copyScriptFolderPath,newScriptName )


            const currentScriptFilePath = path.join(scriptFolderPath , scriptName)

            const currentScriptContent = await fs.readFile(currentScriptFilePath, "utf-8");
             try {
                await fs.access(newScriptpath);
              } catch {

                await fs.writeFile(newScriptpath, currentScriptContent, "utf-8");
              }
        }


        const newScritpMetadataPath = path.join(copyScriptFolderPath, "metadata.json")
        await fs.writeFile(newScritpMetadataPath, JSON.stringify(newScriptMetadeta, null, 2), "utf-8");


    
        //find metadata and model folder data
        
        const metadataPath = path.join(folderPath, "metadata.json");
        const metadataData = await fs.readFile(metadataPath, "utf-8");
        const metadataStructure = JSON.parse(metadataData);
        const processModelPath = path.join(folderPath, "process_model.json");
        var processModelData = await fs.readFile(processModelPath, "utf-8");
        var data = ""
        for(var i in scriptIdMap){
           data = processModelData.replaceAll(i+"",scriptIdMap[i] +"")
           processModelData = data;
        }
        const processModelStructure = JSON.parse(processModelData);
    
        const jsonFiles = ["metadata.json", "process_model.json"];
        for (const file of jsonFiles) {
          const filePath = path.join(newFolderPath, file);
          try {
            await fs.access(filePath);
          } catch {
            let metadata = {};
            if (file === "metadata.json") {
              metadata = {
                processName: folderToCopy.name,
                processId: folderToCopy.id,
                processVersion: metadataStructure.processVersion,
                parentProcess: {
                  parent: "src",
                  path: srcNode ? newFolderPath.replace(srcNode.path, "") : parentFolderPath,
                },
                isLockRequired: metadataStructure.isLockRequired,
                isSharedProcess: metadataStructure.isSharedProcess,
                isInstanceLockNeeded: metadataStructure.isInstanceLockNeeded,
                isDeployed: false,
                scripts: metadataStructure.scripts,
                processVariableFields: metadataStructure.processVariableFields,
              };
            }
            else{
                metadata = processModelStructure;
            }
            await fs.writeFile(filePath, JSON.stringify(metadata, null, 2), "utf-8");
          }
        }
    
    const newFolder = {
        id: folderToCopy.id,
        name: folderToCopy.name,
        path: newFolderPath,
        type: "folder",
        children: [],
      };
  
      if (srcNode?.children) {
        srcNode.children.push(newFolder);
      }
  
      await fs.writeFile(structurePath, JSON.stringify(structure, null, 2));
  
      return NextResponse.json({fs: structure, success: true, newFolderPath });
    } catch (error) {
      return NextResponse.json(
        { error: "Internal Server Error", details: (error as any).message },
        { status: 500 }
      );
    }
}