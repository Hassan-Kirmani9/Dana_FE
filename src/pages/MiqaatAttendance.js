import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { get, _delete } from '../api/axios';
import PageTitle from '../components/Typography/PageTitle';
import SectionTitle from '../components/Typography/SectionTitle';
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableContainer,
  Badge,
  Button,
} from '@windmill/react-ui';
import { AiOutlinePlusCircle, AiOutlineArrowLeft, AiOutlineDelete, AiOutlineDown, AiOutlineEdit } from 'react-icons/ai';
import { EditIcon, TrashIcon } from '../icons';
import CreateMiqaatAttendanceModal from '../components/CreateMiqaatAttendanceModal';
import EditMiqaatAttendanceModal from '../components/EditMiqaatAttendanceModal';
import toast from 'react-hot-toast';

function MiqaatAttendance() {
  const { id } = useParams(); // Get the miqaat ID from URL
  const location = useLocation();
  const history = useHistory();

  const [attendanceData, setAttendanceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [miqaatDetails, setMiqaatDetails] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    // Check if data was passed via location state
    if (location.state?.featureData) {
      setAttendanceData(location.state.featureData);
      setIsLoading(false);
      return;
    }

    // Fetch data
    fetchAttendanceData();
  }, [id, location.state]);

  // Fetch miqaat details
  const fetchAttendanceData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Fetching attendance data for miqaat ID: ${id}`);
      const response = await get(`/miqaat-attendance/${id}`);
      console.log('Attendance response:', response);
      setAttendanceData(response);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Failed to load attendance data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete attendance
  const handleDeleteAttendance = async (attendanceId) => {
    try {
      // Confirm deletion
      const confirmDelete = window.confirm('Are you sure you want to delete this attendance record?');
      
      if (confirmDelete) {
        // Perform delete operation
        await _delete(`/miqaat-attendance/${attendanceId}/`);
        
        // Update the attendance data by removing the deleted item
        setAttendanceData(prevData => ({
          ...prevData,
          miqaat_attendance: prevData.miqaat_attendance.filter(item => item.id !== attendanceId)
        }));
        
        // Show success toast
        toast.success('Attendance record deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      toast.error('Failed to delete attendance record. Please try again.');
    }
  };

  // Handle edit attendance
  const handleEditAttendance = (attendanceItem) => {
    setCurrentAttendance(attendanceItem);
    setIsEditModalOpen(true);
  };

  const handleBackClick = () => {
    history.goBack();
  };

  const handleAddAttendance = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setCurrentAttendance(null);
  };

  const handleAttendanceCreated = () => {
    fetchAttendanceData();
  };

  const handleAttendanceUpdated = () => {
    fetchAttendanceData();
  };


  // Helper function to convert "HH:MM:SS" or "HH:MM" to minutes
  const convertTimeToMinutes = (timeString) => {
    const parts = timeString.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return (hours * 60) + minutes;
  };
  const toggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };
  return (
    <div className="w-full px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={handleBackClick}
            className="mr-4"
          >
            <AiOutlineArrowLeft className="w-5 h-5 dark:text-white" />
          </button>
          <h1
            style={{
              fontSize: window.innerWidth < 768 ? '1.25rem' : '1.5rem',
            }}
            className='font-semibold dark:text-white'
          >
            Attendance
            {miqaatDetails && ` - ${miqaatDetails.miqaat_name}`}
          </h1>
        </div>
        <button 
          onClick={handleAddAttendance} 
          className="flex items-center bg-purple-600 text-white rounded-lg"
          style={{
            fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem',
            padding: window.innerWidth < 768 ? '0.5rem 1rem' : '0.75rem 1rem'
          }}
        >
          <AiOutlinePlusCircle 
            className={`mr-1 ${window.innerWidth < 768 ? 'w-3 h-3' : 'w-4 h-4'}`} 
          />
          Add
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center my-8">
          <p className="text-gray-700">Loading data...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchAttendanceData} 
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table - Hidden on mobile */}
          <TableContainer className="hidden md:block mb-8">
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>ID</TableCell>
                  <TableCell>Member</TableCell>
                  <TableCell>Check-in Time</TableCell>
                  <TableCell>Check-out Time</TableCell>
                  <TableCell>Zone</TableCell>
                  <TableCell>Counter</TableCell>
                  <TableCell className="text-right">Actions</TableCell>
                </tr>
              </TableHeader>
              <TableBody>
                {attendanceData?.miqaat_attendance?.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="text-sm">{index + 1}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{item.member_name || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.checkin_time || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.checkout_time || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.zone_name || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.counter_name || 'N/A'}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <button 
                        onClick={() => handleEditAttendance(item)}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        <AiOutlineEdit className="h-4 w-4 inline-block" />
                      </button>
                      <button 
                        onClick={() => handleDeleteAttendance(item.id)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <AiOutlineDelete className="h-4 w-4 inline-block" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile View - Card Based Layout */}
          <div className="md:hidden space-y-3">
            {!attendanceData?.miqaat_attendance || attendanceData.miqaat_attendance.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-700">No attendance records found</p>
              </div>
            ) : (
              attendanceData.miqaat_attendance.map((item, index) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-lg shadow-md border"
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 h-8 w-8 rounded-full flex items-center justify-center text-gray-700 font-medium">
                        {index + 1}
                      </div>
                      <div className="font-medium">{item.member_name || 'N/A'}</div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(item.id);
                      }}
                      className="text-gray-600"
                    >
                      <AiOutlineDown className="h-4 w-4" />
                    </button>
                  </div>

                  {expandedItem === item.id && (
                    <div className="px-4 pb-4 pt-0 border-t">
                      <div className="mt-2 space-y-2">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Check-in Time:</p>
                          <p className="text-sm">{item.checkin_time || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Check-out Time:</p>
                          <p className="text-sm">{item.checkout_time || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Zone:</p>
                          <p className="text-sm">{item.zone_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Counter:</p>
                          <p className="text-sm">{item.counter_name || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex-grow"></div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditAttendance(item)}
                            className="text-white px-4 py-1 rounded-md bg-blue-600 flex items-center"
                            >
                            <EditIcon className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteAttendance(item.id)}
                            className="text-white px-4 py-1 rounded-md bg-red-600 flex items-center"
                            >
                            <AiOutlineDelete className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Modals remain the same */}
      {isCreateModalOpen && (
        <CreateMiqaatAttendanceModal
          isOpen={isCreateModalOpen}
          onClose={handleCreateModalClose}
          miqaatId={id}
          onSuccess={handleAttendanceCreated}
        />
      )}

      {isEditModalOpen && currentAttendance && (
        <EditMiqaatAttendanceModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          miqaatId={id}
          attendanceData={currentAttendance}
          onSuccess={handleAttendanceUpdated}
        />
      )}
    </div>
  );
}

export default MiqaatAttendance;