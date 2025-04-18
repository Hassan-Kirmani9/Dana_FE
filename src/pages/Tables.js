import React, { useState, useEffect, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus, FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import PageTitle from "../components/Typography/PageTitle";
import { post, get, _delete } from "../api/axios";
import toast from "react-hot-toast";
import { useModal } from '../context/ModalContext';

function Tables() {
  const location = useLocation();
  const history = useHistory();
  const { modalState, openModal, closeModal, clearModalState } = useModal();

  const queryParams = new URLSearchParams(location.search);
  const miqaatType = queryParams.get('miqaat_type');

  const [currentPage, setCurrentPage] = useState(1);
  const [tableData, setTableData] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showThaalsModal, setShowThaalsModal] = useState(false);
  const [selectedThaals, setSelectedThaals] = useState(null);

  const prevMiqaatTypeRef = useRef();
  const fetchingRef = useRef(false);
  const initialRenderRef = useRef(true);
  const prevLocationKeyRef = useRef(location.key); // Track location changes

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

  // Handle modal state when navigating to Tables
  useEffect(() => {
   

    // Only proceed if the location has actually changed
    if (location.key === prevLocationKeyRef.current) {
      return;
    }

    prevLocationKeyRef.current = location.key;

    const isMobileView = window.innerWidth < 768;

    if (isMobileView) {
      if (modalState.fromFeatureModal && modalState.selectedEvent && !modalState.isDialogOpen) {
        openModal(modalState.selectedEvent, true);
      } else if (modalState.isDialogOpen && !modalState.fromFeatureModal) {
        closeModal();
      }
    } else if (modalState.isDialogOpen) {
      closeModal();
    } 
  }, [location.key, modalState.fromFeatureModal, modalState.selectedEvent, modalState.isDialogOpen, openModal, closeModal]);

  const onPageChange = (p) => {
    if (p !== currentPage && !fetchingRef.current) {
      setCurrentPage(p);
      setTimeout(() => {
        fetchMiqaatData(p, miqaatType);
      }, 0);
    }
  };

  const handleCreateClick = () => {
    if (miqaatType) {
      history.push(`/app/forms?miqaat_type=${miqaatType}`);
    } else {
      history.push("/app/forms");
    }
  };

  const handleFeatureClick = (featureType, miqaatId, e, fromFeatureModal = false) => {
    if (e) {
      e.stopPropagation();
    }

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

    const navigationState = {
      fromFeatureModal: fromFeatureModal,
      selectedEvent: fromFeatureModal ? modalState.selectedEvent : null,
    };

    history.push(navigationPath, navigationState);
  };

  const handleDeleteMiqaat = async (id, e) => {
    if (e) {
      e.stopPropagation();
    }

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
    openModal(event);
  };

  const getFeatureColor = (feature) => {
    const colorMap = {
      "Menu": "bg-blue-500",
      "Attendance": "bg-green-500",
      "Counter Packing": "bg-yellow-500",
      "Distribution": "bg-purple-500",
      "Leftover Degs": "bg-teal-500",
    };
    return colorMap[feature] || "bg-gray-500";
  };

  const handleViewThaals = (event, e) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedThaals({
      miqaatName: event.miqaat_name,
      polled: event.thaals_polled || 0,
      cooked: event.thaals_cooked || 0,
      served: event.thaals_served || 0,
    });
    setShowThaalsModal(true);
  };

  const handleEditMiqaat = (id, e) => {
    if (e) {
      e.stopPropagation();
    }
    history.push(`/app/edit-miqaat/${id}`);
  };

  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;

  return (
    <div className="w-full px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <PageTitle>{getPageTitle()}</PageTitle>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded flex items-center"
          onClick={handleCreateClick}
        >
          <FaPlus className="mr-2" /> Create
        </button>
      </div>

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
          <div className="hidden md:block rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
            <div className="w-full">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                      SNO.
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      MIQAAT NAME
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      DATE
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      HIJRI DATE
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                      THAALS
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      FEATURES
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tableData.map((event, index) => (
                    <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-gray-300">{startIndex + index + 1}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-300">{event.miqaat_name}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-gray-300">{new Date(event.miqaat_date).toLocaleDateString()}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-gray-300">{event.hijri_date}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={(e) => handleViewThaals(event, e)}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-md px-3 py-1 w-full"
                        >
                          View
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {[
                            { name: 'Menu', type: 'miqaat-menu' },
                            { name: 'Attendance', type: 'miqaat-attendance' },
                            { name: 'Counter Packing', type: 'counter-packing' },
                            { name: 'Distribution', type: 'distribution' },
                            { name: 'Leftover Degs', type: 'leftover-degs' },
                          ].map((feature) => (
                            <button
                              key={feature.name}
                              onClick={(e) => handleFeatureClick(feature.type, event.id, e)}
                              className={`
                                px-2 py-1 
                                text-xs 
                                text-white 
                                transition-colors
                                hover:brightness-90
                                focus:outline-none
                                focus:ring-1 
                                ${getFeatureColor(feature.name)}
                                rounded
                              `}
                            >
                              {feature.name}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                            onClick={(e) => handleEditMiqaat(event.id, e)}
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                            onClick={(e) => handleDeleteMiqaat(event.id, e)}
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
          </div>

          <div className="md:hidden space-y-4">
            {tableData.map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md"
                onClick={() => handleRowClick(event)}
              >
                <div className="grid grid-cols-3 p-4 cursor-pointer">
                  <div className="col-span-2">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-300">{event.miqaat_name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(event.miqaat_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex justify-end mt-2 space-x-2">
                      <button
                        className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        onClick={(e) => handleEditMiqaat(event.id, e)}
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        onClick={(e) => handleDeleteMiqaat(event.id, e)}
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {startIndex + 1}-{Math.min(startIndex + resultsPerPage, totalResults)} OF {totalResults}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <FaChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="px-4 py-2 bg-purple-600 text-white rounded">
                {currentPage}
              </div>
              <button
                className="p-2 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <FaChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </>
      )}

      {modalState.isDialogOpen && modalState.selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-11/12 max-w-md max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-300">{modalState.selectedEvent.miqaat_name}</h2>
              <button
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={closeModal}
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{new Date(modalState.selectedEvent.miqaat_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hijri Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{modalState.selectedEvent.hijri_date}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Thaals Polled</p>
                  <p className="font-medium text-gray-900 dark:text-white">{modalState.selectedEvent.thaals_polled || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Thaals Cooked</p>
                  <p className="font-medium text-gray-900 dark:text-white">{modalState.selectedEvent.thaals_cooked || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Thaals Served</p>
                  <p className="font-medium text-gray-900 dark:text-white">{modalState.selectedEvent.thaals_served || 0}</p>
                </div>
              </div>
              <div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'Menu', type: 'miqaat-menu', color: 'bg-blue-500' },
                    { name: 'Attendance', type: 'miqaat-attendance', color: 'bg-green-500' },
                    { name: 'Counter Packing', type: 'counter-packing', color: 'bg-yellow-500' },
                    { name: 'Distribution', type: 'distribution', color: 'bg-purple-500' },
                    { name: 'Leftover Degs', type: 'leftover-degs', color: 'bg-teal-500' },
                  ].map((feature) => (
                    <button
                      key={feature.name}
                      onClick={(e) => handleFeatureClick(feature.type, modalState.selectedEvent.id, e, true)}
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

      {showThaalsModal && selectedThaals && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-11/12 max-w-md overflow-hidden shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Thaals for {selectedThaals.miqaatName}
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShowThaalsModal(false)}
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-purple-100 dark:bg-purple-500 p-3 rounded-lg">
                  <div className="text-purple-600 dark:text-white text-sm font-medium">Polled</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedThaals.polled}</div>
                </div>
                <div className="bg-blue-100 dark:bg-blue-500 p-3 rounded-lg">
                  <div className="text-blue-600 dark:text-white text-sm font-medium">Cooked</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedThaals.cooked}</div>
                </div>
                <div className="bg-green-100 dark:bg-green-500 p-3 rounded-lg">
                  <div className="text-green-600 dark:text-white text-sm font-medium">Served</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedThaals.served}</div>
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