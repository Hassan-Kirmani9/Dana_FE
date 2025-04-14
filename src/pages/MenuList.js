import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { get, _delete, patch } from '../api/axios';
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
import { AiOutlinePlusCircle, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import CreateMenuModal from '../components/CreateMenuModal';
import EditMenuModal from '../components/EditMenuModal';
import toast from 'react-hot-toast';

function MenuList() {
  const history = useHistory();
  
  const [menuData, setMenuData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setIsLoading(true);
        const response = await get('/menu/list/');
        setMenuData(response);
      } catch (err) {
        console.error('Error fetching menu data:', err);
        setError('Failed to load menu data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, [refreshTrigger]);

  const handleAddMenu = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleEditClick = (menu) => {
    setCurrentMenu(menu);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setCurrentMenu(null);
  };

  const handleMenuCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleMenuUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Menu updated successfully');
  };

  const handleDeleteMenu = async (id) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this menu item?');

      if (confirmDelete) {
        await _delete(`/menu/${id}/`);
        
        setMenuData(prevData => prevData.filter(item => item.id !== id));
        toast.success('Menu deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      toast.error('Failed to delete menu. Please try again.');
    }
  };

  return (
    <div className="w-full px-4 py-6 dark:bg-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <PageTitle>Menu List</PageTitle>
        <button 
          onClick={handleAddMenu} 
          className="flex items-center bg-purple-600 hover:bg-purple-700 text-white rounded-lg dark:bg-purple-700 dark:hover:bg-purple-600"
          style={{
            fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem',
            padding: window.innerWidth < 768 ? '0.5rem 1rem' : '0.75rem 1rem'
          }}
        >
          <AiOutlinePlusCircle 
            className={`mr-1 ${window.innerWidth < 768 ? 'w-3 h-3' : 'w-4 h-4'}`} 
          />
          Add Menu
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
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </tr>
              </TableHeader>
              <TableBody>
                {menuData.map((item, index) => (
                  <TableRow key={item.id} className="dark:bg-gray-800 dark:hover:bg-gray-700">
                    <TableCell>
                      <span className="text-sm font-semibold dark:text-white">{index + 1}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm dark:text-white">{item.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm dark:text-gray-300">
                        {item.description || 'No description'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                        >
                          <AiOutlineEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMenu(item.id)}
                          className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                        >
                          <AiOutlineDelete className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile View - Simple List */}
          <div className="md:hidden space-y-3">
            {menuData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-700 dark:text-gray-300">No menu items found</p>
              </div>
            ) : (
              menuData.map((item, index) => (
                <div 
                  key={item.id} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                      </div>
                      <h3 className="font-medium text-lg dark:text-white">{item.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                        {item.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditClick(item)}
                        className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 p-1 rounded"
                      >
                        <AiOutlineEdit className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMenu(item.id)}
                        className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 p-1 rounded"
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

      {/* Create Menu Modal */}
      <CreateMenuModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        onMenuCreated={handleMenuCreated}
      />

      {/* Edit Menu Modal */}
      {currentMenu && (
        <EditMenuModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onMenuUpdated={handleMenuUpdated}
          menuData={currentMenu}
        />
      )}
    </div>
  );
}

export default MenuList;