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
import CreateMiqaatMenuModal from '../components/CreateMiqaatMenuModal';

function MiqaatMenu() {
  const { id } = useParams(); // Get the miqaat ID from URL
  const location = useLocation();
  const history = useHistory();
  
  const [menuData, setMenuData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [miqaatDetails, setMiqaatDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check if data was passed via location state
    if (location.state?.featureData) {
      setMenuData(location.state.featureData);
      setIsLoading(false);
      return;
    }
    
    // Fetch data
    fetchMiqaatMenuData();
  }, [id, location.state]);

  // Fetch miqaat menu details
  const fetchMiqaatMenuData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching menu data for miqaat ID: ${id}`);
      const response = await get(`/miqaat-menu/${id}`);
      console.log('Menu response:', response);
      setMenuData(response);
    } catch (err) {
      console.error('Error fetching menu data:', err);
      setError('Failed to load menu data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    history.goBack();
  };

  const handleAddMenu = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleMenuCreated = (newMenu) => {
    // Refresh the data after successful creation
    fetchMiqaatMenuData();
  };

  // Calculate summary metrics
  const calculateSummary = () => {
    if (!menuData?.miqaat_menu || menuData.miqaat_menu.length === 0) {
      return {
        totalMenuItems: 0,
        uniqueMenuNames: []
      };
    }
    
    const summary = {
      totalMenuItems: menuData.miqaat_menu.length,
      uniqueMenuNames: [...new Set(menuData.miqaat_menu.map(item => item.menu_name))]
    };
    
    return summary;
  };

  const summary = calculateSummary();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
        
          <PageTitle>
            Miqaat Menu
            {miqaatDetails && ` - ${miqaatDetails.miqaat_name}`}
          </PageTitle>
        </div>
        <Button onClick={handleAddMenu} className="flex items-center">
          <AiOutlinePlusCircle className="w-4 h-4 mr-1" />
          Add Menu Item
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
          <Button onClick={fetchMiqaatMenuData} className="mt-4">
            Retry
          </Button>
        </div>
      ) : (
        <>

          {/* Menu Table */}
          <TableContainer className="mb-8">
            {!menuData?.miqaat_menu || menuData.miqaat_menu.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-700 dark:text-gray-300">No menu items found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <tr>
                    <TableCell>ID</TableCell>
                    <TableCell>Menu Name</TableCell>
                    <TableCell>Description</TableCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {menuData.miqaat_menu.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <span className="text-sm font-semibold">
                          {item.id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {item.menu_name || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {item.menu_description || 'N/A'}
                        </span>
                      </TableCell>
                    
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </>
      )}

      {/* Create Menu Modal */}
      {isModalOpen && (
        <CreateMiqaatMenuModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          miqaatId={id}
          onSuccess={handleMenuCreated}
        />
      )}
    </>
  );
}

export default MiqaatMenu;