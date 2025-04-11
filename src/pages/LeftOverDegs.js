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
  Button,
} from '@windmill/react-ui';
import { AiOutlinePlusCircle, AiOutlineArrowLeft } from 'react-icons/ai';
import CreateLeftoverDegsModal from './CreateLeftoverDegsModal';

function LeftoverDegs() {
  const { id } = useParams();
  const location = useLocation();
  const history = useHistory();

  const [leftoverData, setLeftoverData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [miqaatDetails, setMiqaatDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check if data was passed via location state
    if (location.state?.featureData) {
      setLeftoverData(location.state.featureData);
      setIsLoading(false);
      return;
    }

    // Fetch data
    fetchLeftoverData();
  }, [id, location.state]);

  // Fetch miqaat details
  useEffect(() => {
    const fetchMiqaatDetails = async () => {
      try {
        const response = await get(`/miqaat/${id}`);
        setMiqaatDetails(response);
      } catch (error) {
        console.error('Error fetching miqaat details:', error);
      }
    };

    fetchMiqaatDetails();
  }, [id]);

  const fetchLeftoverData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Console log for debugging
      console.log(`Fetching leftover degs data for miqaat ID: ${id}`);

      // Fixed URL to match the correct endpoint
      const response = await get(`/leftover-degs/${id}`);
      console.log('Leftover degs response:', response);
      setLeftoverData(response);
    } catch (err) {
      console.error('Error fetching leftover degs data:', err);
      setError('Failed to load leftover degs data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    history.goBack();
  };

  const handleAddLeftoverDeg = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleModalSuccess = (newData) => {
    // Refresh the data after successful creation
    fetchLeftoverData();
  };

  return (
    <>
      <div className="flex items-center justify-between mt-6">
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
              fontSize: window.innerWidth < 768 ? '1.25rem' : '1.5rem',
            }}
            className='font-semibold dark:text-white'
          >
            Leftover Degs
          </h1>
        </div>
        <Button onClick={handleAddLeftoverDeg} className="flex items-center"
          style={{
            fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem',
            padding: window.innerWidth < 768 ? '0.5rem' : '0.75rem'
          }}>
          <AiOutlinePlusCircle className="w-4 h-4 mr-1" />
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
          <Button onClick={fetchLeftoverData} className="mt-4">
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* Leftover Degs Table */}
          <TableContainer className="mb-8 mt-10">
            {!leftoverData?.leftover_degs || leftoverData.leftover_degs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-700 dark:text-gray-300">No leftover degs records found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <tr>
                    <TableCell>ID</TableCell>
                    <TableCell>Menu</TableCell>
                    <TableCell>Container</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Total Cooked</TableCell>
                    <TableCell>Total Received</TableCell>
                    <TableCell>Zone</TableCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {leftoverData.leftover_degs.map((item) => (
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
                          {item.container_name || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {item.unit_name || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {item.total_cooked != null ? item.total_cooked : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {item.total_received != null ? item.total_received : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {item.zone_name || 'N/A'}
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

      {/* Create Leftover Degs Modal */}
      <CreateLeftoverDegsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        miqaatId={id}
        onSuccess={handleModalSuccess}
      />
    </>
  );
}

export default LeftoverDegs;