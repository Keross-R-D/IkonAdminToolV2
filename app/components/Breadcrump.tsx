"use client"
import { RenderAppBreadcrumb } from '@/ikon/components/app-breadcrumb';
import { useParams, useSearchParams } from 'next/navigation';
import React from 'react'

export default function BreadcrumbComp({page,title} :{page : string , title : string}) {
    const searchParams = useSearchParams();
    const params = useParams()
    console.log(searchParams.get('name'))
    return (
        <>
            <RenderAppBreadcrumb breadcrumb={{ level: 1, title: `${title} - ${searchParams.get('name')}`, href: `/${page}/${params.myTask? params.myTask : params.workflow}?name=${searchParams.get('name')}` }} />
        </>
    )
}

