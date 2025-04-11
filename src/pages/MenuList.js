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
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { EditIcon, TrashIcon } from '../icons';
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
    toast.success('Menu created successfully');
  };

  const handleMenuUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Menu updated successfully');
  };

  const handleDeleteMenu = async (id) => {
    try {
      // Confirm deletion
      const confirmDelete = window.confirm('Are you sure you want to delete this menu item?');

      if (confirmDelete) {
        // Perform delete operation
        await _delete(`/menu/${id}/`);
        
        // Update the menu data by removing the deleted item
        setMenuData(prevData => prevData.filter(item => item.id !== id));
        toast.success('Menu deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      toast.error('Failed to delete menu. Please try again.');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle>Menu List</PageTitle>
        <Button onClick={handleAddMenu} className="flex items-center">
          <AiOutlinePlusCircle className="w-4 h-4 mr-1" />
          Add Menu
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
          {menuData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-700 dark:text-gray-300">No menu items found</p>
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
                {menuData.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="text-sm font-semibold">{index + 1}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {item.description || 'No description'}
                      </span>
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
                          onClick={() => handleDeleteMenu(item.id)}
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
    </>
  );
}

export default MenuList;