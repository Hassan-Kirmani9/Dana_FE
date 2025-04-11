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
import CreateUnitModal from '../components/CreateUnitModal';
import EditUnitModal from '../components/EditUnitModal';
import toast from 'react-hot-toast';

function Unit() {
  const history = useHistory();
  
  const [unitData, setUnitData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchUnitData = async () => {
      try {
        setIsLoading(true);
        const response = await get('/unit/list/');
        setUnitData(response);
      } catch (err) {
        console.error('Error fetching unit data:', err);
        setError('Failed to load unit data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnitData();
  }, [refreshTrigger]);

  const handleAddUnit = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleEditClick = (unit) => {
    setCurrentUnit(unit);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setCurrentUnit(null);
  };

  const handleUnitCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Unit created successfully');
  };

  const handleUnitUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Unit updated successfully');
  };

  const handleDeleteUnit = async (id) => {
    try {
      // Confirm deletion
      const confirmDelete = window.confirm('Are you sure you want to delete this unit?');

      if (confirmDelete) {
        // Perform delete operation
        await _delete(`/unit/${id}/`);
        
        // Update the unit data by removing the deleted item
        setUnitData(prevData => prevData.filter(item => item.id !== id));
        toast.success('Unit deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
      toast.error('Failed to delete unit. Please try again.');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle>Units</PageTitle>
        <Button onClick={handleAddUnit} className="flex items-center">
          <AiOutlinePlusCircle className="w-4 h-4 mr-1" />
          Add Unit
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
          {unitData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-700 dark:text-gray-300">No units found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Actions</TableCell>
                </tr>
              </TableHeader>
              <TableBody>
                {unitData.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="text-sm font-semibold">{index + 1}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.name}</span>
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
                          onClick={() => handleDeleteUnit(item.id)}
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

      {/* Create Unit Modal */}
      <CreateUnitModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        onUnitCreated={handleUnitCreated}
      />

      {/* Edit Unit Modal */}
      {currentUnit && (
        <EditUnitModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onUnitUpdated={handleUnitUpdated}
          unitData={currentUnit}
        />
      )}
    </>
  );
}

export default Unit;