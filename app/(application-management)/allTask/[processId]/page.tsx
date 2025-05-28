"use client"
// import DraggableDialog from '@/app/components/DraggableDialog';
import { PersonStanding, SquareUser } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { string } from 'zod';
import MyTaskModal from './components/MyTaskModal';
import { Button } from '@/shadcn/ui/button';
import MyTaskInstanceModal from './components/MyTaskDataModal';


interface InstanceDataInterface {
  processInstanceId: string,
  sender: string,
  lockedByMe: boolean,
  action: string,
  taskName: string,
  message: string,
  taskId: string,
  suspended: boolean,
  timestamp: string,
  data: any
}

export default function page() {
  const paramsData = useParams() as { myTask: string };
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [modalName, setModalName] = useState<string>('');
  const [instanceData, setInstanceData] = useState<InstanceDataInterface[]>([]);
  const [isLoading, setInLoading] = useState<boolean>(false);

  const [isInstanceDataModalOpen, setIsInstanceDataModalOpen] = useState<boolean>(false);
  const [instanceEntryData, setInstanceEntryData] = useState<any>({});

  const openJobModal = () => {
    setModalName('Job')
    setIsOpen(true)
  }

  const openHistoryModal = () => {
    setModalName('History')
    setIsOpen(true)
  }

  const openClockModal = () => {
    setModalName('Clock')
    setIsOpen(true)
  }

  const openDataModal = (instanceEntryData:any) => {
    setInstanceEntryData(instanceEntryData)
    setIsInstanceDataModalOpen(true);
  }


  const params = useParams();
  const processId = params.processId as string;
  const getAllInstances = 'true';
  const getMyTasksRequestUrl = `/api/remote/tasks?processId=${processId}&getAllInstances=${getAllInstances}`


  useEffect(() => {
    async function fetchInstanceData() {
      try {

        setInLoading(true);

        const response = await fetch(getMyTasksRequestUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if(response.ok) {
          const data = await response.json()
          setInstanceData(data.instances);
        }

      }
      catch(err) {

      }
      finally {
        setInLoading(false);
      }

    }

    fetchInstanceData();
  },[])

  return (
    <div className="p-4 h-full">

      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 h-full">
        <div className="flex items-center justify-between p-2 px-3">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{decodeURIComponent(paramsData.myTask).split('/')[1]}</h1>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search"
              className="border p-1 rounded"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 h-[88%] overflow-y-auto">
          <div className="w-full border table-auto text-sm p-2  py-0">
            <div>
              {instanceData.map((row, index) => (
                <div
                key={index}
                className="flex items-center justify-between border rounded-xl shadow-sm px-2 py-1  w-full max-w-full my-1 "
              >
                <div className="flex items-center gap-2 w-[20%] pe-4">
                  <SquareUser  />
                  <div className="text-sm text-gray-800 dark:text-white font-medium">
                    <div className="flex "> {row.sender}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 w-[20%] pe-4">
                  <div className="text-sm text-gray-800 dark:text-white font-medium">
                    <div className="flex "> {row.action}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-[50%] pe-4">
                  <div className="text-sm text-gray-800 dark:text-white font-semibold">
                    <div className="flex">{row.message}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-[20%] pe-4">
                  <div className="text-sm text-gray-800 dark:text-white font-medium">
                    <div className="text-xs text-gray-500">{new Date(row.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                {/* <div className="flex flex-grow gap-2 items-center justify-between px-[4rem]">
                  <div className="text-sm text-gray-800 dark:text-white font-medium">
                    {row.action}
                  </div>
                  <div className="text-xs text-gray-500">{row.description}</div>
                </div> */}

                <div className="flex flex-grow gap-2 items-center justify-end pe-4">
                    <Button className="bg-teal-500 text-white px-2 py-1 rounded " onClick={()=>{openDataModal(row.data)}} >Data</Button>
                    <Button className="bg-teal-500 text-white px-2 py-1 rounded" onClick={()=>{openJobModal()}}>Jobs</Button>
                    <Button className="bg-teal-500 text-white px-2 py-1 rounded" onClick={()=>{openHistoryModal()}}>History</Button>
                    <Button className="bg-teal-500 text-white px-2 py-1 rounded" onClick={()=>{openClockModal()}}>Clock</Button>
                    <Button className="bg-yellow-400 text-white px-2 py-1 rounded">Suspend</Button>
                    <Button className="bg-cyan-300 text-white px-2 py-1 rounded">Activate</Button>
                    <Button className="bg-red-500 text-white px-2 py-1 rounded">Delete</Button>
                    <Button className="bg-green-500 text-white px-2 py-1 rounded">Backup</Button>
                  {/* <Tooltip tooltipContent="Edit Script" side={"top"}>
                    <Button onClick={() => handleEditScript(index)} variant="outline" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip tooltipContent="Delete Script" side={"top"}>
                    <Button onClick={() => handleScriptDeletion(index)} variant="outline" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </Tooltip> */}
                </div>
              </div>
              
              ))}
            </div>
          </div>
          
        </div>
        <div className="  flex  p-2  h-10 items-center justify-center border-t ">
           {/* <div className='flex text-sm text-gray-500 dark:text-gray-400'> Showing {filteredData.length} of {instanceData.length} entries</div>  */}
           <div></div>
          </div>
      </div>
      <MyTaskModal isOpen={isOpen} modalName={modalName} setModal={setIsOpen} data={{}} extraParams={{}} columns={{}} />
      <MyTaskInstanceModal isOpen={isInstanceDataModalOpen} setModal={setIsInstanceDataModalOpen} instanceEntryData={instanceEntryData}/>
      {/* <DraggableDialog draggable={true}>
        hii
        
      </DraggableDialog> */}
    </div>
  )
}


