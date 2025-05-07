
import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { getAllGrievances, getGrievancesByUser, GrievanceStatus } from '@/services/grievanceService';
import { Button } from '@/components/ui/button';
import { Search, FileText, Filter } from 'lucide-react';

const GrievanceList = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') as GrievanceStatus | null;

  const [searchTerm, setSearchTerm] = useState('');
  const [currentStatus, setCurrentStatus] = useState<GrievanceStatus | 'all'>(statusFilter || 'all');

  // Get grievances based on user role
  const allGrievances = user?.role === 'admin' ? getAllGrievances() : getGrievancesByUser(user?.id || '');
  
  // Apply filters
  const filteredGrievances = useMemo(() => {
    return allGrievances.filter(grievance => {
      const matchesSearch = 
        grievance.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grievance.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grievance.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = currentStatus === 'all' || grievance.status === currentStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [allGrievances, searchTerm, currentStatus]);

  return (
    <MainLayout requireAuth>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{user?.role === 'admin' ? 'All Grievances' : 'My Grievances'}</h1>
          <p className="text-muted-foreground">Manage and track all grievances in the system</p>
        </div>
        
        {user?.role === 'user' && (
          <Link to="/grievances/new">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              New Grievance
            </Button>
          </Link>
        )}
      </div>

      <div className="bg-card rounded-lg shadow border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search grievances..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-muted-foreground" />
            <select
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value as GrievanceStatus | 'all')}
              className="form-input"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Title</th>
              {user?.role === 'admin' && <th className="px-4 py-3">Submitted By</th>}
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrievances.map((grievance) => (
              <tr key={grievance.id} className="border-b border-border hover:bg-muted/50">
                <td className="px-4 py-3">{grievance.id}</td>
                <td className="px-4 py-3">{grievance.title}</td>
                {user?.role === 'admin' && <td className="px-4 py-3">{grievance.userName}</td>}
                <td className="px-4 py-3">{grievance.category}</td>
                <td className="px-4 py-3">
                  <span className={`
                    ${grievance.status === 'pending' ? 'grievance-status-pending' : ''}
                    ${grievance.status === 'in-progress' ? 'grievance-status-inprogress' : ''}
                    ${grievance.status === 'resolved' ? 'grievance-status-resolved' : ''}
                    ${grievance.status === 'rejected' ? 'grievance-status-rejected' : ''}
                  `}>
                    {grievance.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {new Date(grievance.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Link 
                    to={`/grievances/${grievance.id}`}
                    className="text-primary hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {filteredGrievances.length === 0 && (
              <tr>
                <td colSpan={user?.role === 'admin' ? 7 : 6} className="px-4 py-8 text-center text-muted-foreground">
                  No grievances found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
};

export default GrievanceList;
