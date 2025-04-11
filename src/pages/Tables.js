import React, { useState, useEffect, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import PageTitle from "../components/Typography/PageTitle";
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableFooter,
  TableContainer,
  Badge,
  Button,
  Pagination,
} from "@windmill/react-ui";
import { EditIcon, TrashIcon } from "../icons";
import { AiOutlinePlusCircle } from "react-icons/ai";
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
  const [isFeatureLoading, setIsFeatureLoading] = useState(false);

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
        return 'Ramadan Miqaats';
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

      console.log(`Fetching data: ${url}`);
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
    // Only fetch if we haven't fetched yet (initial render) 
    // or the miqaat type has actually changed
    const shouldFetch = initialRenderRef.current ||
      prevMiqaatTypeRef.current !== miqaatType;

    if (shouldFetch && !fetchingRef.current) {
      // Update for initial render tracking
      initialRenderRef.current = false;

      // Set current page and fetch data
      if (prevMiqaatTypeRef.current !== miqaatType) {
        setCurrentPage(1);
      }

      // Store current miqaat type for next comparison
      prevMiqaatTypeRef.current = miqaatType;

      // Fetch with slight delay to avoid potential timing issues
      setTimeout(() => {
        fetchMiqaatData(1, miqaatType);
      }, 0);
    }
  }, [miqaatType]);

  // Handle page changes initiated by the user
  const onPageChange = (p) => {
    if (p !== currentPage && !fetchingRef.current) {
      setCurrentPage(p);
      // Use setTimeout to ensure state updates before fetch
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
  // Handle fetching data from feature-specific endpoints and navigating
  const handleFeatureClick = async (featureType, miqaatId) => {
    try {
      // Set loading state to true when feature is clicked
      setIsFeatureLoading(true);
  
      let endpoint = '';
      let navigationPath = '';
  
      switch (featureType) {
        case 'miqaat-menu':
          endpoint = `/miqaat-menu/${miqaatId}`;
          navigationPath = `/app/miqaat-menu/${miqaatId}`;
          break;
        case 'miqaat-attendance':
          endpoint = `/miqaat-attendance/${miqaatId}`;
          navigationPath = `/app/miqaat-attendance/${miqaatId}`;
          break;
        case 'counter-packing':
          endpoint = `/counter-packing/${miqaatId}`;
          navigationPath = `/app/counter-packing/${miqaatId}`;
          break;
        case 'distribution':
          endpoint = `/distribution/${miqaatId}`;
          navigationPath = `/app/distribution/${miqaatId}`;
          break;
        case 'leftover-degs':
          endpoint = `/leftover-degs/${miqaatId}`;
          navigationPath = `/app/leftover-degs/${miqaatId}`;
          break;
        default:
          console.error('Unknown feature type:', featureType);
          setIsFeatureLoading(false);
          return;
      }
  
      const response = await get(endpoint);
  
      if (response) {
        history.push({
          pathname: navigationPath,
          state: { featureData: response }
        });
      }
    } catch (error) {
      console.error(`Error fetching ${featureType} data for ID ${miqaatId}:`, error);
      toast.error(`Failed to load ${featureType} data`);
    } finally {
      // Ensure loading state is set to false
      setIsFeatureLoading(false);
    }
  };
  
 
  const handleDeleteMiqaat = async (id) => {
    try {
      // Confirm deletion
      const confirmDelete = window.confirm('Are you sure you want to delete this Miqaat?');

      if (confirmDelete) {
        // Perform delete operation
        const res = await _delete(`/miqaat/${id}/`);
        console.log(res, "!@!@!@!@!@1");

        // Optionally, update the table data or redirect
        // For example, remove the deleted item from the list
        setTableData(prevData => prevData.filter(item => item.id !== id));
        toast.success('Miqaat deleted successfully');


      }
    } catch (error) {
      console.error('Error deleting Miqaat:', error);
      alert('Failed to delete Miqaat. Please try again.');
    }
  };
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
        <PageTitle>{getPageTitle()}</PageTitle>

        </div>
        <Button onClick={handleCreateClick} className="flex items-center">
          <AiOutlinePlusCircle className="w-4 h-4 mr-1" />
          Create
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300">Loading data...</p>
          </div>
        </div>
      ) : (
        <TableContainer className="mb-8">
          {tableData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-700 dark:text-gray-300">No records found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <tr>
                    <TableCell>Sno.</TableCell>
                    <TableCell>Miqaat Name</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Hijri Date</TableCell>
                    <TableCell>Features</TableCell>
                    <TableCell>Actions</TableCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {tableData.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <p className="font-semibold">{i + 1}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <div>
                            <p className="font-semibold">{item.miqaat_name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(item.miqaat_date).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge type="primary">
                          {item.hijri_date}
                        </Badge>
                      </TableCell>
                   
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <button onClick={() => handleFeatureClick('miqaat-menu', item.id)}
                            className="px-2 py-1 text-xs rounded-l-md bg-indigo-600 text-white hover:bg-indigo-700">
                            Menu
                          </button>
                          <button onClick={() => handleFeatureClick('miqaat-attendance', item.id)}
                            className="px-2 py-1 text-xs bg-green-600 text-white hover:bg-green-700">
                            Attendance
                          </button>
                          <button onClick={() => handleFeatureClick('counter-packing', item.id)}
                            className="px-2 py-1 text-xs bg-yellow-600 text-white hover:bg-yellow-700">
                            Counter Packing
                          </button>
                          <button
                            onClick={() => handleFeatureClick('distribution', item.id)}
                            className="px-2 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Distribution
                          </button>
                          <button onClick={() => handleFeatureClick('leftover-degs', item.id)}
                            className="px-2 py-1 text-xs rounded-r-md bg-teal-600 text-white hover:bg-teal-700">
                            Leftover Degs
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-4">
                          <Button
                            layout="link"
                            size="icon"
                            aria-label="Edit"
                            onClick={() => history.push(`/app/edit-miqaat/${item.id}`)}
                          >
                            <EditIcon className="w-5 h-5" aria-hidden="true" />
                          </Button>
                          <Button
                            layout="link"
                            size="icon"
                            aria-label="Delete"
                            onClick={() => handleDeleteMiqaat(item.id)}
                          >
                            <TrashIcon className="w-5 h-5" aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TableFooter>
                <Pagination
                  totalResults={totalResults}
                  resultsPerPage={resultsPerPage}
                  onChange={onPageChange}
                  label="Table navigation"
                  currentPage={currentPage}
                />
              </TableFooter>
            </>
          )}
        </TableContainer>
      )}
  {isFeatureLoading && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div 
      style={{
        border: '4px solid #e6e6fa',
        borderTop: '4px solid #8a2be2',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        animation: 'spin 1s linear infinite'
      }}
    />
    <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)}
    </>
  );
}

export default Tables;