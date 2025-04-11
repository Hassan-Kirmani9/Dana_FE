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
  Button
} from '@windmill/react-ui';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { EditIcon, TrashIcon } from '../icons';
import CreateCounterModal from '../components/CreateCounterModal';
import EditCounterModal from '../components/EditCounterModal';
import toast from 'react-hot-toast';

function Counter() {
  const history = useHistory();

  const [counterData, setCounterData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCounter, setCurrentCounter] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchCounterData = async () => {
      try {
        setIsLoading(true);
        const response = await get('/counter/list/');
        setCounterData(response);
      } catch (err) {
        console.error('Error fetching counter data:', err);
        setError('Failed to load counter data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounterData();
  }, [refreshTrigger]);

  const handleAddCounter = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleEditClick = (counter) => {
    setCurrentCounter(counter);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setCurrentCounter(null);
  };

  const handleCounterCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Counter created successfully');
  };

  const handleCounterUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Counter updated successfully');
  };

  const handleDeleteCounter = async (id) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this counter?');

      if (confirmDelete) {
        await _delete(`/counter/${id}/`);
        setCounterData(prevData => prevData.filter(item => item.id !== id));
        toast.success('Counter deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting counter:', error);
      toast.error('Failed to delete counter. Please try again.');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle>Counters</PageTitle>
        <Button onClick={handleAddCounter} className="flex items-center">
          <AiOutlinePlusCircle className="w-4 h-4 mr-1" />
          Add Counter
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
          {counterData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-700 dark:text-gray-300">No counters found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Zone</TableCell>
                  <TableCell>Actions</TableCell>
                </tr>
              </TableHeader>
              <TableBody>
                {counterData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="text-sm font-semibold">{item.id}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.zone_name || 'N/A'}</span>
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
                          onClick={() => handleDeleteCounter(item.id)}
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

      <CreateCounterModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        onCounterCreated={handleCounterCreated}
      />

      {currentCounter && (
        <EditCounterModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onCounterUpdated={handleCounterUpdated}
          counterData={currentCounter}
        />
      )}
    </>
  );
}

export default Counter;