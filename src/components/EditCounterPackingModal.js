import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
  Select
} from '@windmill/react-ui';
import { get, patch } from '../api/axios';
import toast from 'react-hot-toast';

const EditCounterPackingModal = ({ 
  isOpen, 
  onClose, 
  miqaatId, 
  counterPackingData,
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    miqaat: miqaatId,
    zone: '',
    miqaat_menu: '',
    unit: '',
    container: '',
    quantity: '',
    filled_percentage: ''
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    zones: [],
    miqaat_menus: [],
    units: [],
    containers: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form data when counter packing data changes
  useEffect(() => {
    if (counterPackingData) {
      setFormData({
        miqaat: miqaatId,
        zone: counterPackingData.zone ? counterPackingData.zone.id : '',
        miqaat_menu: counterPackingData.miqaat_menu ? counterPackingData.miqaat_menu.id : '',
        unit: counterPackingData.unit ? counterPackingData.unit.id : '',
        container: counterPackingData.container ? counterPackingData.container.id : '',
        quantity: counterPackingData.quantity || '',
        filled_percentage: counterPackingData.filled_percentage || ''
      });
    }
  }, [counterPackingData, miqaatId]);
  
  // Fetch dropdown options
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const [zonesRes, miqaatMenusRes, unitsRes, containersRes] = await Promise.all([
          get('/zone/list/'),
          get(`/miqaat-menu/${miqaatId}/`),
          get('/unit/list/'),
          get('/container/list/')
        ]);

        setDropdownOptions({
          zones: zonesRes,
          miqaat_menus: miqaatMenusRes.miqaat_menu,
          units: unitsRes,
          containers: containersRes
        });
      } catch (err) {
        console.error('Error fetching dropdown options:', err);
        setError('Failed to load dropdown options');
      }
    };

    if (isOpen) {
      fetchDropdownOptions();
    }
  }, [isOpen, miqaatId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      const requiredFields = ['zone', 'miqaat_menu', 'unit', 'container', 'quantity', 'filled_percentage'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      // Prepare submission data
      const submissionData = {
        ...formData,
        miqaat: parseInt(miqaatId),
        zone: parseInt(formData.zone),
        miqaat_menu: parseInt(formData.miqaat_menu),
        unit: parseInt(formData.unit),
        container: parseInt(formData.container),
        quantity: parseInt(formData.quantity),
        filled_percentage: parseFloat(formData.filled_percentage)
      };

      // Submit the form
      await patch(`/counter-packing/${counterPackingData.id}/`, submissionData);
      
      // Show success toast
      toast.success('Counter packing record updated successfully');
      
      // Call success callback
      onSuccess();
      
      // Close the modal
      onClose();
    } catch (err) {
      console.error('Error updating counter packing record:', err);
      setError(err.response?.data?.message || 'Failed to update counter packing record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Edit Counter Packing Record</ModalHeader>
      <ModalBody>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Zone Dropdown */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Zone *</span>
              <Select
                name="zone"
                value={formData.zone}
                onChange={handleInputChange}
                className="mt-1"
                required
              >
                <option value="">Select Zone</option>
                {dropdownOptions.zones.map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </Select>
            </Label>

            {/* Miqaat Menu Dropdown */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Miqaat Menu *</span>
              <Select
                name="miqaat_menu"
                value={formData.miqaat_menu}
                onChange={handleInputChange}
                className="mt-1"
                required
              >
                <option value="">Select Miqaat Menu</option>
                {dropdownOptions.miqaat_menus.map(menu => (
                  <option key={menu.id} value={menu.id}>
                    {menu.menu_name}
                  </option>
                ))}
              </Select>
            </Label>

            {/* Unit Dropdown */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Unit *</span>
              <Select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="mt-1"
                required
              >
                <option value="">Select Unit</option>
                {dropdownOptions.units.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </Select>
            </Label>

            {/* Container Dropdown */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Container *</span>
              <Select
                name="container"
                value={formData.container}
                onChange={handleInputChange}
                className="mt-1"
                required
              >
                <option value="">Select Container</option>
                {dropdownOptions.containers.map(container => (
                  <option key={container.id} value={container.id}>
                    {container.name}
                  </option>
                ))}
              </Select>
            </Label>

            {/* Quantity Input */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Quantity *</span>
              <Input 
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="Enter quantity"
                min="0"
                required
              />
            </Label>

            {/* Filled Percentage Input */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Filled Percentage *</span>
              <Input 
                type="number"
                name="filled_percentage"
                value={formData.filled_percentage}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="Enter filled percentage"
                min="0"
                max="100"
                step="0.1"
                required
              />
            </Label>
          </div>
        </form>
      </ModalBody>
      <ModalFooter>
        <div className="hidden sm:block">
      
        </div>
        <div className="hidden sm:block">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update'}
          </Button>
        </div>
        
        {/* Mobile buttons */}
        <div className="w-full sm:hidden">
     
          <Button 
            block 
            size="large" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default EditCounterPackingModal;