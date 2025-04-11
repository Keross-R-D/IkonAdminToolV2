"use client"
import { RenderAppBreadcrumb } from '@/ikon/components/app-breadcrumb';
import { useParams } from 'next/navigation';
import React from 'react'

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const params = useParams();
    return (
        <>
            <RenderAppBreadcrumb breadcrumb={{ level: 1, title: "Workflow", href: `/workflow/${params?.workflow}` }} />
            {children   }
        </>
    )
}

