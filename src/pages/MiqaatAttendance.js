import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { get } from '../api/axios';
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
  Card,
  CardBody,
} from '@windmill/react-ui';
import { AiOutlinePlusCircle, AiOutlineArrowLeft } from 'react-icons/ai';
import CreateMiqaatAttendanceModal from '../components/CreateMiqaatAttendanceModal';

function MiqaatAttendance() {
  const { id } = useParams(); // Get the miqaat ID from URL
  const location = useLocation();
  const history = useHistory();
  
  const [attendanceData, setAttendanceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [miqaatDetails, setMiqaatDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleBackClick = () => {
    history.goBack();
  };

  const handleAddAttendance = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleAttendanceCreated = (newAttendance) => {
    // Refresh the data after successful creation
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
         
          <PageTitle>
            Attendance
            {miqaatDetails && ` - ${miqaatDetails.miqaat_name}`}
          </PageTitle>
        </div>
        <Button onClick={handleAddAttendance} className="flex items-center">
          <AiOutlinePlusCircle className="w-4 h-4 mr-1" />
          Add Attendance
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
          <TableContainer className="mb-8">
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
      {isModalOpen && (
        <CreateMiqaatAttendanceModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          miqaatId={id}
          onSuccess={handleAttendanceCreated}
        />
      )}
    </>
  );
}

export default MiqaatAttendance;