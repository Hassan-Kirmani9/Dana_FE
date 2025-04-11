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
import { AiOutlinePlusCircle, AiOutlineArrowLeft } from 'react-icons/ai';
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

  return (
    <>
      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center">
          <Button
            layout="link"
            onClick={handleBackClick}
            className="mr-4"
          >
            <AiOutlineArrowLeft className="w-5 h-5" />
          </Button>
          <h1
            style={{
              fontSize: window.innerWidth < 768 ? '1.25rem' : '1.5rem'
            }}
            className='font-semibold dark:text-white'
          >
            Attendance
            {miqaatDetails && ` - ${miqaatDetails.miqaat_name}`}
          </h1>
        </div>
        <Button
          onClick={handleAddAttendance}
          className="flex items-center"
          style={{
            fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem',
            padding: window.innerWidth < 768 ? '0.5rem' : '0.75rem'
          }}
        >
          <AiOutlinePlusCircle
            className={`mr-1 ${window.innerWidth < 768 ? 'w-3 h-3' : 'w-4 h-4'}`}
          />
          Add
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300">Loading data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button onClick={fetchAttendanceData} className="mt-4">
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* Attendance Table */}
          <TableContainer className="mb-8 mt-10">
            {!attendanceData?.miqaat_attendance || attendanceData.miqaat_attendance.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-700 dark:text-gray-300">No attendance records found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <tr>
                    <TableCell>ID</TableCell>
                    <TableCell>Member</TableCell>
                    <TableCell>Check-in Time</TableCell>
                    <TableCell>Check-out Time</TableCell>
                    <TableCell>Zone</TableCell>
                    <TableCell>Counter</TableCell>
                    <TableCell>Actions</TableCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {attendanceData.miqaat_attendance.map((item) => {
                    // Calculate duration
                    let duration = 'N/A';
                    if (item.checkin_time && item.checkout_time) {
                      const checkinMinutes = convertTimeToMinutes(item.checkin_time);
                      const checkoutMinutes = convertTimeToMinutes(item.checkout_time);

                      // Handle cases where checkout might be next day
                      const durationMinutes = checkoutMinutes >= checkinMinutes
                        ? checkoutMinutes - checkinMinutes
                        : (24 * 60) - checkinMinutes + checkoutMinutes;

                      const hours = Math.floor(durationMinutes / 60);
                      const minutes = durationMinutes % 60;
                      duration = `${hours}h ${minutes}m`;
                    }

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <span className="text-sm font-semibold">
                            {item.id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {item.member_name || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {item.checkin_time || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {item.checkout_time || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {item.zone_name || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {item.counter_name || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              layout="link"
                              size="icon"
                              aria-label="Edit"
                              onClick={() => handleEditAttendance(item)}
                            >
                              <EditIcon className="w-5 h-5 text-blue-600" aria-hidden="true" />
                            </Button>
                            <Button
                              layout="link"
                              size="icon"
                              aria-label="Delete"
                              onClick={() => handleDeleteAttendance(item.id)}
                            >
                              <TrashIcon className="w-5 h-5 text-red-600" aria-hidden="true" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </>
      )}

      {/* Create Attendance Modal */}
      {isCreateModalOpen && (
        <CreateMiqaatAttendanceModal
          isOpen={isCreateModalOpen}
          onClose={handleCreateModalClose}
          miqaatId={id}
          onSuccess={handleAttendanceCreated}
        />
      )}

      {/* Edit Attendance Modal */}
      {isEditModalOpen && currentAttendance && (
        <EditMiqaatAttendanceModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          miqaatId={id}
          attendanceData={currentAttendance}
          onSuccess={handleAttendanceUpdated}
        />
      )}
    </>
  );
}

export default MiqaatAttendance;