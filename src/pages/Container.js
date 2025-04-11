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
import CreateContainerModal from '../components/CreateContainerModal';
import EditContainerModal from '../components/EditContainerModal';
import toast from 'react-hot-toast';

function Container() {
    const history = useHistory();

    const [containerData, setContainerData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentContainer, setCurrentContainer] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchContainerData = async () => {
            try {
                setIsLoading(true);
                const response = await get('/container/list/');
                setContainerData(response);
            } catch (err) {
                console.error('Error fetching container data:', err);
                setError('Failed to load container data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchContainerData();
    }, [refreshTrigger]);

    const handleAddContainer = () => {
        setIsCreateModalOpen(true);
    };

    const handleCreateModalClose = () => {
        setIsCreateModalOpen(false);
    };

    const handleEditClick = (container) => {
        setCurrentContainer(container);
        setIsEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setCurrentContainer(null);
    };

    const handleContainerCreated = () => {
        setRefreshTrigger(prev => prev + 1);
        toast.success('Container created successfully');
    };

    const handleContainerUpdated = () => {
        setRefreshTrigger(prev => prev + 1);
        toast.success('Container updated successfully');
    };

    const handleDeleteContainer = async (id) => {
        try {
            // Confirm deletion
            const confirmDelete = window.confirm('Are you sure you want to delete this container?');

            if (confirmDelete) {
                // Perform delete operation
                await _delete(`/container/${id}/`);

                // Update the container data by removing the deleted item
                setContainerData(prevData => prevData.filter(item => item.id !== id));
                toast.success('Container deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting container:', error);
            toast.error('Failed to delete container. Please try again.');
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <PageTitle>Containers</PageTitle>
                <Button onClick={handleAddContainer} className="flex items-center">
                    <AiOutlinePlusCircle className="w-4 h-4 mr-1" />
                    Add Container
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
                    {containerData.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-700 dark:text-gray-300">No containers found</p>
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
                                {containerData.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <span className="text-sm font-semibold">{item.id}</span>
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
                                                    onClick={() => handleDeleteContainer(item.id)}
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

            {/* Create Container Modal */}
            <CreateContainerModal
                isOpen={isCreateModalOpen}
                onClose={handleCreateModalClose}
                onContainerCreated={handleContainerCreated}
            />

            {/* Edit Container Modal */}
            {currentContainer && (
                <EditContainerModal
                    isOpen={isEditModalOpen}
                    onClose={handleEditModalClose}
                    onContainerUpdated={handleContainerUpdated}
                    containerData={currentContainer}
                />
            )}
        </>
    );
}

export default Container;