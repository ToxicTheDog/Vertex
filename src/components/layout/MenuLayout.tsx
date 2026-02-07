 import { Outlet } from 'react-router-dom';
 import { Header } from './Header';
 
 export function MenuLayout() {
   return (
     <div className="min-h-screen flex flex-col w-full">
       <Header showSidebarTrigger={false} />
       <main className="flex-1">
         <Outlet />
       </main>
     </div>
   );
 }