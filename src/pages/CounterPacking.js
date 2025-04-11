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
import CreateCounterPackingModal from '../components/CreateCounterPackingModal';

function CounterPacking() {
    const { id } = useParams(); // Get the miqaat ID from URL
    const location = useLocation();
    const history = useHistory();

    const [counterPackingData, setCounterPackingData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [miqaatDetails, setMiqaatDetails] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Check if data was passed via location state
        if (location.state?.featureData) {
            setCounterPackingData(location.state.featureData);
            setIsLoading(false);
            return;
        }

        // Fetch data
        fetchCounterPackingData();
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

    const fetchCounterPackingData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            console.log(`Fetching counter packing data for miqaat ID: ${id}`);
            const response = await get(`/counter-packing/${id}`);
            console.log('Counter packing response:', response);
            setCounterPackingData(response);
        } catch (err) {
            console.error('Error fetching counter packing data:', err);
            setError('Failed to load counter packing data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackClick = () => {
        history.goBack();
    };

    const handleAddCounterPacking = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleCounterPackingCreated = (newCounterPacking) => {
        // Refresh the data after successful creation
        fetchCounterPackingData();
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
                        className='font-semibold'
                    >
                        Counter Packing
                    </h1>
                </div>
                <Button onClick={handleAddCounterPacking} className="flex items-center"
                    style={{
                        fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem',
                        padding: window.innerWidth < 768 ? '0.5rem' : '0.75rem'
                    }}>
                    <AiOutlinePlusCircle className="w-4 h-4 mr-1" />
                    Add
                </Button>
            </div>
            {/* 
      <div className="flex justify-between items-center mt-6">
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
              fontSize: window.innerWidth < 768 ? '1.25rem' : '1.5rem'
            }}
          >
            Attendance
            {miqaatDetails && ` - ${miqaatDetails.miqaat_name}`}
          </h1>
        </div>
        <Button
          onClick={handleAddAttendance}
          className="flex items-center"
          style={{
            fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem',
            padding: window.innerWidth < 768 ? '0.5rem' : '0.75rem'
          }}
        >
          <AiOutlinePlusCircle
            className={`mr-1 ${window.innerWidth < 768 ? 'w-3 h-3' : 'w-4 h-4'}`}
          />
          Add Attendance
        </Button>
      </div> */}

            {isLoading ? (
                <div className="flex justify-center my-8">
                    <div className="text-center">
                        <p className="text-gray-700 dark:text-gray-300">Loading data...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                    <Button onClick={fetchCounterPackingData} className="mt-4">
                        Retry
                    </Button>
                </div>
            ) : (
                <>
                    {/* Counter Packing Table */}
                    <TableContainer className="mb-8 mt-10">
                        {!counterPackingData?.counter_packing || counterPackingData.counter_packing.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-700 dark:text-gray-300">No counter packing records found</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <tr>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Menu</TableCell>
                                        <TableCell>Unit</TableCell>
                                        <TableCell>Container</TableCell>
                                        <TableCell>Quantity</TableCell>
                                        <TableCell>Filled %</TableCell>
                                        <TableCell>Zone</TableCell>
                                    </tr>
                                </TableHeader>
                                <TableBody>
                                    {counterPackingData.counter_packing.map((item) => (
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
                                                    {item.unit_name || 'N/A'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {item.container_name || 'N/A'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-medium">
                                                    {item.quantity != null ? item.quantity : 'N/A'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge type="success">
                                                    {item.filled_percentage != null ? `${item.filled_percentage}%` : 'N/A'}
                                                </Badge>
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

            {/* Create Counter Packing Modal */}
            <CreateCounterPackingModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                miqaatId={id}
                onSuccess={handleCounterPackingCreated}
            />
        </>
    );
}

export default CounterPacking;