import { RenderAppBreadcrumb } from '@/ikon/components/app-breadcrumb';
import React from 'react'
import BreadcrumbComp from '../../../components/Breadcrump';

export default async function Layout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {/* <RenderAppBreadcrumb breadcrumb={{ level: 1, title: `My Task - ${decodeURIComponent(searchParams?.myTask).split('/')[1]}`, href: `/workflow/${searchParams?.myTask}` }} /> */}
           <BreadcrumbComp page={"myTask"} title="My tasks"/>
            {children}
        </>
    )
}

