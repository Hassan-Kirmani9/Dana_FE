import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { get, _delete } from '../api/axios';
import PageTitle from '../components/Typography/PageTitle';
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableContainer,
  Button,
} from '@windmill/react-ui';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { EditIcon, TrashIcon } from '../icons';
import CreateZoneModal from '../components/CreateZoneModal';
import EditZoneModal from '../components/EditZoneModal';
import toast from 'react-hot-toast';

function Zone() {
  const history = useHistory();
  
  const [zoneData, setZoneData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentZone, setCurrentZone] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchZoneData = async () => {
      try {
        setIsLoading(true);
        const response = await get('/zone/list/');
        setZoneData(response);
      } catch (err) {
        console.error('Error fetching zone data:', err);
        setError('Failed to load zone data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchZoneData();
  }, [refreshTrigger]);

  const handleAddZone = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleEditClick = (zone) => {
    setCurrentZone(zone);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setCurrentZone(null);
  };

  const handleZoneCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Zone created successfully');
  };

  const handleZoneUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Zone updated successfully');
  };

  const handleDeleteZone = async (id) => {
    try {
      // Confirm deletion
      const confirmDelete = window.confirm('Are you sure you want to delete this zone?');

      if (confirmDelete) {
        // Perform delete operation
        await _delete(`/zone/${id}/`);
        
        // Update the zone data by removing the deleted item
        setZoneData(prevData => prevData.filter(item => item.id !== id));
        toast.success('Zone deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast.error('Failed to delete zone. Please try again.');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle>Zones</PageTitle>
        <Button onClick={handleAddZone} className="flex items-center">
          <AiOutlinePlusCircle className="w-4 h-4 mr-1" />
          Add Zone
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
        </div>
      ) : (
        <TableContainer className="mb-8">
          {zoneData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-700 dark:text-gray-300">No zones found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </tr>
              </TableHeader>
              <TableBody>
                {zoneData.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="text-sm font-semibold">{index + 1}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.description || 'No description'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-4">
                        <Button
                          layout="link"
                          size="icon"
                          aria-label="Edit"
                          onClick={() => handleEditClick(item)}
                        >
                          <EditIcon className="w-5 h-5" aria-hidden="true" />
                        </Button>
                        <Button
                          layout="link"
                          size="icon"
                          aria-label="Delete"
                          onClick={() => handleDeleteZone(item.id)}
                        >
                          <TrashIcon className="w-5 h-5" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      )}

      {/* Create Zone Modal */}
      <CreateZoneModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        onZoneCreated={handleZoneCreated}
      />

      {/* Edit Zone Modal */}
      {currentZone && (
        <EditZoneModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onZoneUpdated={handleZoneUpdated}
          zoneData={currentZone}
        />
      )}
    </>
  );
}

export default Zone;