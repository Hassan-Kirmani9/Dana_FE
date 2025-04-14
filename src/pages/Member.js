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
    Badge,
} from '@windmill/react-ui';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { EditIcon, TrashIcon } from '../icons';
import CreateMemberModal from '../components/CreateMemberModal';
import EditMemberModal from '../components/EditMemberModal';
import toast from 'react-hot-toast';

function Member() {
    const history = useHistory();

    const [memberData, setMemberData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentMember, setCurrentMember] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

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
            // Confirm deletion
            const confirmDelete = window.confirm('Are you sure you want to delete this member?');

            if (confirmDelete) {
                // Perform delete operation
                await _delete(`/member/${id}/`);

                // Update the member data by removing the deleted item
                setMemberData(prevData => prevData.filter(item => item.id !== id));
                toast.success('Member deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting member:', error);
            toast.error('Failed to delete member. Please try again.');
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <PageTitle>Members</PageTitle>
                <Button onClick={handleAddMember} className="flex items-center">
                    <AiOutlinePlusCircle className="w-4 h-4 mr-1" />
                    Add Member
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
                    {memberData.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-700 dark:text-gray-300">No members found</p>
                        </div>
                    ) : (
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
                                                    <EditIcon className="w-5 h-5" aria-hidden="true" />
                                                </Button>
                                                <Button
                                                    layout="link"
                                                    size="icon"
                                                    aria-label="Delete"
                                                    onClick={() => handleDeleteMember(item.id)}
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
        </>
    );
}

export default Member;