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
import { AiOutlinePlusCircle, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import CreateMemberModal from '../components/CreateMemberModal';
import EditMemberModal from '../components/EditMemberModal';
import toast from 'react-hot-toast';
import {
    AiOutlineClose,
    AiOutlinePhone,
    AiOutlineWhatsApp,
    AiOutlineHome
} from 'react-icons/ai';

function Member() {
    const history = useHistory();

    const [memberData, setMemberData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentMember, setCurrentMember] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    useEffect(() => {
        const fetchMemberData = async () => {
            try {
                setIsLoading(true);
                const response = await get('/member/list/');
                setMemberData(response);
            } catch (err) {
                console.error('Error fetching member data:', err);
                setError('Failed to load member data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMemberData();
    }, [refreshTrigger]);

    const handleAddMember = () => {
        setIsCreateModalOpen(true);
    };

    const handleCreateModalClose = () => {
        setIsCreateModalOpen(false);
    };

    const handleMemberDetails = (member) => {
        setSelectedMember(member);
        setIsDetailsModalOpen(true);
    };

    const handleDetailsModalClose = () => {
        setSelectedMember(null);
        setIsDetailsModalOpen(false);
    };

    const handleEditClick = (member) => {
        setCurrentMember(member);
        setIsEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setCurrentMember(null);
    };

    const handleMemberCreated = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleMemberUpdated = () => {
        setRefreshTrigger(prev => prev + 1);
        toast.success('Member updated successfully');
    };

    const handleDeleteMember = async (id) => {
        try {
            const confirmDelete = window.confirm('Are you sure you want to delete this member?');

            if (confirmDelete) {
                await _delete(`/member/${id}/`);

                setMemberData(prevData => prevData.filter(item => item.id !== id));
                toast.success('Member deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting member:', error);
            toast.error('Failed to delete member. Please try again.');
        }
    };

    // Helper function to get initials
    const getInitials = (name) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="w-full px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <PageTitle>Members</PageTitle>
                <button
                    onClick={handleAddMember}
                    className="flex items-center bg-purple-600 text-white rounded-lg"
                    style={{
                        fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem',
                        padding: window.innerWidth < 768 ? '0.5rem 1rem' : '0.75rem 1rem'
                    }}
                >
                    <AiOutlinePlusCircle
                        className={`mr-1 ${window.innerWidth < 768 ? 'w-3 h-3' : 'w-4 h-4'}`}
                    />
                    Add Member
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
                                    <TableCell>ITS</TableCell>
                                    <TableCell>Full Name</TableCell>
                                    <TableCell>Contact</TableCell>
                                    <TableCell>WhatsApp</TableCell>
                                    <TableCell>Mohalla</TableCell>
                                    <TableCell>Actions</TableCell>
                                </tr>
                            </TableHeader>
                            <TableBody>
                                {memberData.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <span className="text-sm font-semibold">{item.its}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{item.full_name}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{item.contact_number || 'N/A'}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{item.whatsapp_number || 'N/A'}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{item.mohalla || 'N/A'}</span>
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
                                                    onClick={() => handleDeleteMember(item.id)}
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

                    {/* Mobile View */}
                    <div className="md:hidden space-y-3">
                        {memberData.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No members found
                            </div>
                        ) : (
                            memberData.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 transition-colors"
                                    onClick={() => handleMemberDetails(item)}
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
                                                <p className="font-medium dark:text-white truncate">{item.full_name}</p>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                <span className="truncate">
                                                    ITS: {item.its}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditClick(item);
                                                }}
                                                className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1 rounded"
                                            >
                                                <AiOutlineEdit className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteMember(item.id);
                                                }}
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

                    {/* Details Modal - Moved Outside the Map Loop */}
                    {selectedMember && isDetailsModalOpen && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }} // Custom style for light tint
                            onClick={handleDetailsModalClose}
                        >
                            <div
                                className="bg-white dark:bg-gray-800 rounded-lg w-11/12 max-w-md max-h-[90vh] overflow-auto p-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold dark:text-white">Member Details</h2>
                                    <button
                                        onClick={handleDetailsModalClose}
                                        className="text-gray-600 dark:text-gray-300 hover:text-gray-800"
                                    >
                                        <AiOutlineClose className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="flex items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-medium dark:text-white">{selectedMember.full_name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">ITS: {selectedMember.its}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                                        <p className="flex items-center dark:text-white">
                                            <AiOutlinePhone className="mr-2 text-gray-500 dark:text-gray-400" />
                                            {selectedMember.contact_number || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">WhatsApp</p>
                                        <p className="flex items-center dark:text-white">
                                            <AiOutlineWhatsApp className="mr-2 text-green-500 " />
                                            {selectedMember.whatsapp_number || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Mohalla</p>
                                        <p className="flex items-center dark:text-white">
                                            <AiOutlineHome className="mr-2 text-gray-500 dark:text-gray-400" />
                                            {selectedMember.mohalla || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Create Member Modal */}
            <CreateMemberModal
                isOpen={isCreateModalOpen}
                onClose={handleCreateModalClose}
                onMemberCreated={handleMemberCreated}
            />

            {/* Edit Member Modal */}
            {currentMember && (
                <EditMemberModal
                    isOpen={isEditModalOpen}
                    onClose={handleEditModalClose}
                    onMemberUpdated={handleMemberUpdated}
                    memberData={currentMember}
                />
            )}
        </div>
    );
}

export default Member;