
import { RenderAppBreadcrumb } from '@/ikon/components/app-breadcrumb';
import { headers } from 'next/headers';
import React from 'react'

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // const [projectData, setProjectData] = useState<any>(null);
    // const [showSpinner, setShowSpinner] = useState(false);

    const header = await headers();
      const host =
        (header.get("x-forwarded-proto") || "http") +
        "://" +
        (header.get("host") || "localhost:3000");
      const response = await fetch(`${host}/api/get_projectData`);
      const projectData = await response.json();
    // useEffect(() => {
    //     const fetchData = async () => {
    //       setShowSpinner(true);
    //       try {
    //         const response = await fetch("/api/get_projectData");
    
    //         if (!response.ok) {
    //           const errorData = await response.json();
    //           throw new Error(errorData.error || "Failed to edit folder");
    //         } else {
    //           setShowSpinner(false);
    // debugger
              
    //           const data = await response.json();
    //           setProjectData(data); // Set the project data in state
              
    //         }
    //       } catch (err) {
    //         console.error("❌ Edit folder error:", err);
    //         return;
    //       }
    //     };
    
    //     fetchData();
    //   }, []);
    return (
        <>
            <RenderAppBreadcrumb breadcrumb={{ level: 0, title: `${projectData?.projectName} - Application Management`, href: "/" }} />
            {children   }
        </>
    )
}

