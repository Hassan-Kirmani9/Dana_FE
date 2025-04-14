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
import { 
  AiOutlinePlusCircle, 
  AiOutlineEdit, 
  AiOutlineDelete 
} from 'react-icons/ai';
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
      const confirmDelete = window.confirm('Are you sure you want to delete this unit?');

      if (confirmDelete) {
        await _delete(`/unit/${id}/`);
        
        setUnitData(prevData => prevData.filter(item => item.id !== id));
        toast.success('Unit deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
      toast.error('Failed to delete unit. Please try again.');
    }
  };

  return (
    <div className="w-full px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <PageTitle>Units</PageTitle>
        <button 
          onClick={handleAddUnit} 
          className="flex items-center bg-purple-600 text-white rounded-lg"
          style={{
            fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem',
            padding: window.innerWidth < 768 ? '0.5rem 1rem' : '0.75rem 1rem'
          }}
        >
          <AiOutlinePlusCircle 
            className={`mr-1 ${window.innerWidth < 768 ? 'w-3 h-3' : 'w-4 h-4'}`} 
          />
          Add Unit
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center my-8">
          <p className="text-gray-700 dark:text-gray-300">Loading data...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table - Hidden on mobile */}
          <TableContainer className="hidden md:block mb-8">
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
                          <AiOutlineEdit className="w-5 h-5" aria-hidden="true" />
                        </Button>
                        <Button
                          layout="link"
                          size="icon"
                          aria-label="Delete"
                          onClick={() => handleDeleteUnit(item.id)}
                        >
                          <AiOutlineDelete className="w-5 h-5" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile View - List with Unit Cards */}
          <div className="md:hidden space-y-3">
            {unitData.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No units found
              </div>
            ) : (
              unitData.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 transition-colors"
                >
                  <div className="flex items-center p-3">
                    <div 
                      className="h-12 w-12 mr-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 
                      flex items-center justify-center font-medium"
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium dark:text-white truncate">{item.name}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditClick(item)}
                        className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1 rounded"
                      >
                        <AiOutlineEdit className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUnit(item.id)}
                        className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded"
                      >
                        <AiOutlineDelete className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
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
    </div>
  );
}

export default Unit;