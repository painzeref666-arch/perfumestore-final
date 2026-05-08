import type{Metadata}from'next';
import AdminDashboard from'./components/AdminDashboard';
export const metadata:Metadata={title:'Admin Login — Exousia & Co.'};
export default function AdminPage(){return <AdminDashboard/>}
