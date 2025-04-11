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
import CreateDistributionModal from './CreateDistributionModal';

function Distribution() {
  const { id } = useParams();
  const location = useLocation();
  const history = useHistory();

  const [distributionData, setDistributionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [miqaatDetails, setMiqaatDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check if data was passed via location state
    if (location.state?.featureData) {
      setDistributionData(location.state.featureData);
      setIsLoading(false);
      return;
    }

    // Fetch data
    fetchDistributionData();
  }, [id, location.state]);

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

  const fetchDistributionData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Fetching distribution data for miqaat ID: ${id}`);
      const response = await get(`/distribution/${id}`);
      console.log('Distribution response:', response);
      setDistributionData(response);
    } catch (err) {
      console.error('Error fetching distribution data:', err);
      setError('Failed to load distribution data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    history.goBack();
  };

  const handleAddDistribution = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleDistributionCreated = (newDistribution) => {
    fetchDistributionData();
  };

  const calculateTotals = () => {
    if (!distributionData?.distributions) return { total: 0, ibadullah: 0, mumin: 0 };

    return distributionData.distributions.reduce((acc, item) => {
      return {
        total: acc.total + item.ibadullah_count + item.mumin_count,
        ibadullah: acc.ibadullah + item.ibadullah_count,
        mumin: acc.mumin + item.mumin_count
      };
    }, { total: 0, ibadullah: 0, mumin: 0 });
  };

  const totals = calculateTotals();

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
              fontSize: window.innerWidth < 768 ? '1rem' : '1.5rem',
            }}
            className='font-semibold'
          >            Distribution 
          </h1>
        </div>
        <Button onClick={handleAddDistribution} className="flex items-center"
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
          <Button onClick={fetchDistributionData} className="mt-4">
            Retry
          </Button>
        </div>
      ) : (
        <>
          <TableContainer className="mb-8 mt-10">
            {!distributionData?.distributions || distributionData.distributions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-700 dark:text-gray-300">No distribution records found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <tr>
                    <TableCell>ID</TableCell>
                    <TableCell>Menu</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Filled %</TableCell>
                    <TableCell>Ibadullah Count</TableCell>
                    <TableCell>Mumin Count</TableCell>
                    <TableCell>Total Count</TableCell>
                    <TableCell>Zone</TableCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {distributionData.distributions.map((item) => (
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
                          {item.quantity || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge type="success">
                          {item.filled_percentage || 'N/A'}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {item.ibadullah_count != null ? item.ibadullah_count : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {item.mumin_count != null ? item.mumin_count : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-bold">
                          {item.ibadullah_count + item.mumin_count}
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

      <CreateDistributionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        miqaatId={id}
        onSuccess={handleDistributionCreated}
      />
    </>
  );
}

export default Distribution;