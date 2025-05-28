
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DataTable } from '@/ikon/components/data-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shadcn/ui/dialog'
import React from 'react'

export default function MyTaskModal({ isOpen, setModal, modalName, data, columns, extraParams }: { isOpen: boolean, setModal: any, modalName: string, data: any, columns: any, extraParams: any }) {

    return (
        <Dialog open={isOpen} onOpenChange={setModal}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{modalName}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    {data.length > 0 ? (
                        <DataTable columns={columns} data={data} extraParams={extraParams} />
                    ) : (
                        <div className="flex items-center justify-center h-full w-full text-gray-500 dark:text-gray-400">
                            <p>No data available</p>
                        </div>
                    )}

                </div>
            </DialogContent>

        </Dialog>
    )
}
