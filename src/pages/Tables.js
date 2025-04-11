import React, { useState, useEffect, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus, FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import PageTitle from "../components/Typography/PageTitle";
import { post, get, _delete } from "../api/axios";
import toast from "react-hot-toast";

function Tables() {
  const location = useLocation();
  const history = useHistory();

  // Get miqaat_type from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const miqaatType = queryParams.get('miqaat_type');

  // State for the table
  const [currentPage, setCurrentPage] = useState(1);
  const [tableData, setTableData] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Using refs to prevent infinite loops
  const prevMiqaatTypeRef = useRef();
  const fetchingRef = useRef(false);
  const initialRenderRef = useRef(true);

  // Pagination setup
  const resultsPerPage = 10;

  const getPageTitle = () => {
    switch (miqaatType) {
      case 'general_miqaats':
        return 'General Miqaats';
      case 'ramadan':
        return 'Ramadan';
      case 'private_events':
        return 'Private Events';
      default:
        return 'Miqaats';
    }
  };

  const fetchMiqaatData = async (page, type) => {
    if (fetchingRef.current) return;

    fetchingRef.current = true;
    setIsLoading(true);

    try {
      let url = '/miqaat/filter/';
      if (type) {
        url += `?miqaat_type=${type}`;
      }

      const response = await get(url);

      if (response && Array.isArray(response)) {
        setTableData(response.slice((page - 1) * resultsPerPage, page * resultsPerPage));
        setTotalResults(response.length);
      } else {
        console.error('Unexpected response format:', response);
        setTableData([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error('Error fetching miqaat data:', error);
      setTableData([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  };

  // Only run on mount and when miqaatType changes
  useEffect(() => {
    const shouldFetch = initialRenderRef.current || prevMiqaatTypeRef.current !== miqaatType;

    if (shouldFetch && !fetchingRef.current) {
      initialRenderRef.current = false;

      if (prevMiqaatTypeRef.current !== miqaatType) {
        setCurrentPage(1);
      }

      prevMiqaatTypeRef.current = miqaatType;

      setTimeout(() => {
        fetchMiqaatData(1, miqaatType);
      }, 0);
    }
  }, [miqaatType]);

  // Handle page changes initiated by the user
  const onPageChange = (p) => {
    if (p !== currentPage && !fetchingRef.current) {
      setCurrentPage(p);
      setTimeout(() => {
        fetchMiqaatData(p, miqaatType);
      }, 0);
    }
  };

  // Modified to pass the miqaat_type to the form
  const handleCreateClick = () => {
    if (miqaatType) {
      history.push(`/app/forms?miqaat_type=${miqaatType}`);
    } else {
      history.push("/app/forms");
    }
  };

  const handleFeatureClick = (featureType, miqaatId) => {
    let navigationPath = '';

    switch (featureType) {
      case 'miqaat-menu':
        navigationPath = `/app/miqaat-menu/${miqaatId}`;
        break;
      case 'miqaat-attendance':
        navigationPath = `/app/miqaat-attendance/${miqaatId}`;
        break;
      case 'counter-packing':
        navigationPath = `/app/counter-packing/${miqaatId}`;
        break;
      case 'distribution':
        navigationPath = `/app/distribution/${miqaatId}`;
        break;
      case 'leftover-degs':
        navigationPath = `/app/leftover-degs/${miqaatId}`;
        break;
      default:
        console.error('Unknown feature type:', featureType);
        return;
    }

    // Navigate to the feature page
    history.push(navigationPath);
  };

  const handleDeleteMiqaat = async (id) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this Miqaat?');

      if (confirmDelete) {
        const res = await _delete(`/miqaat/${id}/`);
        setTableData(prevData => prevData.filter(item => item.id !== id));
        toast.success('Miqaat deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting Miqaat:', error);
      alert('Failed to delete Miqaat. Please try again.');
    }
  };

  const handleRowClick = (event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const getFeatureColor = (feature) => {
    const colorMap = {
      "Menu": "bg-blue-500",
      "Attendance": "bg-green-500",
      "Counter Packing": "bg-yellow-500",
      "Distribution": "bg-purple-500",
      "Leftover Degs": "bg-teal-500"
    };
    return colorMap[feature] || "bg-gray-500";
  };

  // Pagination calculations
  const totalPages = Math.ceil(tableData.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;

  return (
    <div className="w-full px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <PageTitle>{getPageTitle()}</PageTitle>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded flex items-center"
          onClick={handleCreateClick}
        >
          <FaPlus className="mr-2" /> Create
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center my-8">
          <p className="text-gray-700 dark:text-gray-400">Loading data...</p>
        </div>
      ) : tableData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-700 dark:text-gray-400">No records found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table - Hidden on mobile */}
          <div className="hidden md:block overflow-x-auto rounded-lg">
            <table className="w-full dark:bg-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">SNO.</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">MIQAAT NAME</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">DATE</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">HIJRI DATE</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">FEATURES</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:bg-gray-800">
                {tableData.map((event, index) => (
                  <tr key={event.id} className="bg-white">
                    <td className="px-4 py-3 text-sm dark:bg-gray-800 dark:text-gray-400">{startIndex + index + 1}</td>
                    <td className="px-4 py-3 text-sm dark:bg-gray-800 dark:text-gray-400 font-medium">{event.miqaat_name}</td>
                    <td className="px-4 py-3 text-sm dark:bg-gray-800 dark:text-gray-400">{new Date(event.miqaat_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm dark:bg-gray-800 dark:text-gray-400">{event.hijri_date}</td>
                    <td className="px-4 py-3 dark:bg-gray-800">
                      <div className="flex items-center space-x-1">
                        {[
                          { name: 'Menu', type: 'miqaat-menu' },
                          { name: 'Attendance', type: 'miqaat-attendance' },
                          { name: 'Counter Packing', type: 'counter-packing' },
                          { name: 'Distribution', type: 'distribution' },
                          { name: 'Leftover Degs', type: 'leftover-degs' }
                        ].map((feature) => (
                          <button
                            key={feature.name}
                            onClick={() => handleFeatureClick(feature.type, event.id)}
                            className={`px-2 py-1 text-xs text-white rounded ${getFeatureColor(feature.name)}`}
                          >
                            {feature.name}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 dark:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-gray-600 dark:text-gray-400 hover:text-blue-600"
                          onClick={() => history.push(`/app/edit-miqaat/${event.id}`)}
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-gray-600 dark:text-gray-400 hover:text-red-600"
                          onClick={() => handleDeleteMiqaat(event.id)}
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {tableData.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md"
                onClick={() => handleRowClick(event)}
              >
                <div className="grid grid-cols-3 p-4 cursor-pointer">
                  <div className="col-span-2">
                    <h3 className="font-semibold text-gray-800">{event.miqaat_name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(event.miqaat_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-purple-600 font-medium">
                      {event.hijri_date}
                    </p>
                    <div className="flex justify-end mt-2 space-x-2">
                      <button
                        className="text-gray-600 hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          history.push(`/app/edit-miqaat/${event.id}`);
                        }}
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMiqaat(event.id);
                        }}
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(startIndex + resultsPerPage, tableData.length)} OF {tableData.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <FaChevronLeft className="h-4 w-4 dark:text-gray-400" />
              </button>
              <div className="px-4 py-2 bg-purple-600 text-white rounded">
                {currentPage}
              </div>
              <button
                className="p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <FaChevronRight className="h-4 w-4 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Features Dialog */}
      {isDialogOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-11/12 max-w-md max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4">
              <h2 className="text-xl font-semibold">{selectedEvent.miqaat_name} - Features</h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setIsDialogOpen(false)}
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{new Date(selectedEvent.miqaat_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hijri Date</p>
                  <p className="font-medium">{selectedEvent.hijri_date}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Thaals Polled</p>
                  <p className="font-medium">{selectedEvent.thaals_polled}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Thaals Cooked</p>
                  <p className="font-medium">{selectedEvent.thaals_cooked}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Thaals Served</p>
                  <p className="font-medium">{selectedEvent.thaals_served}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-4">Features</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'Menu', type: 'miqaat-menu', color: 'bg-blue-500' },
                    { name: 'Attendance', type: 'miqaat-attendance', color: 'bg-green-500' },
                    { name: 'Counter Packing', type: 'counter-packing', color: 'bg-yellow-500' },
                    { name: 'Distribution', type: 'distribution', color: 'bg-purple-500' },
                    { name: 'Leftover Degs', type: 'leftover-degs', color: 'bg-teal-500' }
                  ].map((feature) => (
                    <button
                      key={feature.name}
                      onClick={() => handleFeatureClick(feature.type, selectedEvent.id)}
                      className={`w-full py-10 text-white rounded-lg text-base font-semibold ${feature.color} hover:opacity-90 transition-all`}
                    >
                      {feature.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tables;