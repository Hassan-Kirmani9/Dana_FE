import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { get, _delete } from '../api/axios';
import { AiOutlinePlusCircle, AiOutlineArrowLeft, AiOutlineDown, AiOutlineDelete } from 'react-icons/ai';
import toast from 'react-hot-toast';
import {
    Table,
    TableHeader,
    TableCell,
    TableBody,
    TableRow,
    TableContainer,
} from '@windmill/react-ui';

import CreateMiqaatMenuModal from '../components/CreateMiqaatMenuModal';

function MiqaatMenu() {
    const { id } = useParams();
    const location = useLocation();
    const history = useHistory();

    const [menuData, setMenuData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [miqaatDetails, setMiqaatDetails] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedItem, setExpandedItem] = useState(null);

    useEffect(() => {
        if (location.state?.featureData) {
            setMenuData(location.state.featureData);
            setIsLoading(false);
            return;
        }

        fetchMiqaatMenuData();
    }, [id, location.state]);

    const fetchMiqaatMenuData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await get(`/miqaat-menu/${id}`);
            setMenuData(response);
        } catch (err) {
            console.error('Error fetching menu data:', err);
            setError('Failed to load menu data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteMenuItem = async (menuItemId) => {
        try {
            const confirmDelete = window.confirm('Are you sure you want to delete this menu item?');

            if (confirmDelete) {
                await _delete(`/miqaat-menu/${menuItemId}/`);

                setMenuData(prevData => ({
                    ...prevData,
                    miqaat_menu: prevData.miqaat_menu.filter(item => item.id !== menuItemId)
                }));

                toast.success('Menu item deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting menu item:', error);
            toast.error('Failed to delete menu item. Please try again.');
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

    const handleMenuCreated = () => {
        fetchMiqaatMenuData();
    };

    const toggleExpand = (id) => {
        setExpandedItem(expandedItem === id ? null : id);
    };

    return (
        <div className="w-full px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button
                        onClick={handleBackClick}
                        className="mr-4"
                    >
                        <AiOutlineArrowLeft className="w-5 h-5" />
                    </button>
                    <h1
                        style={{
                            fontSize: window.innerWidth < 768 ? '1.25rem' : '1.5rem',
                        }}
                        className='font-semibold'
                    >
                        Miqaat Menu
                        {miqaatDetails && ` - ${miqaatDetails.miqaat_name}`}
                    </h1>
                </div>
                <button
                    onClick={handleAddMenu}
                    className="flex items-center bg-purple-600 text-white rounded-lg"
                    style={{
                        fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem',
                        padding: window.innerWidth < 768 ? '0.5rem 1rem' : '0.75rem 1rem'
                    }}
                >
                    <AiOutlinePlusCircle
                        className={`mr-1 ${window.innerWidth < 768 ? 'w-3 h-3' : 'w-4 h-4'}`}
                    />
                    Add
                </button>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex justify-center my-8">
                    <p className="text-gray-700">Loading data...</p>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchMiqaatMenuData}
                        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded"
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <>
                    {/* Desktop Table - Hidden on mobile */}
                    <TableContainer className="hidden md:block mb-8">
                        <Table>
                            <TableHeader>
                                <tr>
                                    <TableCell>ID</TableCell>
                                    <TableCell>MENU NAME</TableCell>
                                    <TableCell>DESCRIPTION</TableCell>
                                    <TableCell className="text-right">ACTIONS</TableCell>
                                </tr>
                            </TableHeader>
                            <TableBody>
                                {menuData?.miqaat_menu?.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <span className="text-sm">{index + 1}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium">{item.menu_name}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{item.menu_description}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <button
                                                onClick={() => handleDeleteMenuItem(item.id)}
                                                className="text-gray-600 hover:text-red-600"
                                            >
                                                <AiOutlineDelete className="h-4 w-4 inline-block" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Mobile View - Card Based Layout */}
                    <div className="md:hidden space-y-3">
                        {!menuData?.miqaat_menu || menuData.miqaat_menu.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-700">No menu items found</p>
                            </div>
                        ) : (
                            menuData.miqaat_menu.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-lg shadow-md border"
                                >
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer"
                                        onClick={() => toggleExpand(item.id)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-gray-100 h-8 w-8 rounded-full flex items-center justify-center text-gray-700 font-medium">
                                                {index + 1}
                                            </div>
                                            <div className="font-medium">{item.menu_name}</div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleExpand(item.id);
                                            }}
                                            className="text-gray-600"
                                        >
                                            <AiOutlineDown className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {expandedItem === item.id && (
                                        <div className="px-4 pb-4 pt-0 border-t">
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500 mb-1">Description:</p>
                                                <p className="text-sm">{item.menu_description}</p>
                                            </div>
                                            <div className="mt-4 flex justify-between items-center">
                                                <div className="flex-grow"></div>
                                                <button
                                                    onClick={() => handleDeleteMenuItem(item.id)}
                                                    className="text-white px-4 py-1 rounded-md bg-red-600 flex items-center"
                                                >
                                                    <AiOutlineDelete className="h-4 w-4 mr-1" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
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
        </div>
    );
}

export default MiqaatMenu;