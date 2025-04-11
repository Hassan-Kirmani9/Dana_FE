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

const EditLeftoverDegsModal = ({ 
  isOpen, 
  onClose, 
  miqaatId, 
  leftoverDegsData,
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    miqaat: miqaatId,
    zone: '',
    menu: '',
    unit: '',
    container: '',
    total_cooked: '',
    total_received: ''
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    zones: [],
    menus: [],
    units: [],
    containers: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form data when leftover degs data changes
  useEffect(() => {
    if (leftoverDegsData) {
      setFormData({
        miqaat: miqaatId,
        zone: leftoverDegsData.zone ? leftoverDegsData.zone.id : '',
        menu: leftoverDegsData.menu ? leftoverDegsData.menu.id : '',
        unit: leftoverDegsData.unit ? leftoverDegsData.unit.id : '',
        container: leftoverDegsData.container ? leftoverDegsData.container.id : '',
        total_cooked: leftoverDegsData.total_cooked || '',
        total_received: leftoverDegsData.total_received || ''
      });
    }
  }, [leftoverDegsData, miqaatId]);
  
  // Fetch dropdown options
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const [zonesRes, menusRes, unitsRes, containersRes] = await Promise.all([
          get('/zone/list/'),
          get('/menu/list/'),
          get('/unit/list/'),
          get('/container/list/')
        ]);

        setDropdownOptions({
          zones: zonesRes,
          menus: menusRes,
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
  }, [isOpen]);

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
      const requiredFields = ['zone', 'menu', 'unit', 'container', 'total_cooked', 'total_received'];
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
        menu: parseInt(formData.menu),
        unit: parseInt(formData.unit),
        container: parseInt(formData.container),
        total_cooked: parseInt(formData.total_cooked),
        total_received: parseInt(formData.total_received)
      };

      // Submit the form
      await patch(`/leftover-degs/${leftoverDegsData.id}/`, submissionData);
      
      // Show success toast
      toast.success('Leftover degs record updated successfully');
      
      // Call success callback
      onSuccess();
      
      // Close the modal
      onClose();
    } catch (err) {
      console.error('Error updating leftover degs record:', err);
      setError(err.response?.data?.message || 'Failed to update leftover degs record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Edit Leftover Degs Record</ModalHeader>
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

            {/* Menu Dropdown */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Menu *</span>
              <Select
                name="menu"
                value={formData.menu}
                onChange={handleInputChange}
                className="mt-1"
                required
              >
                <option value="">Select Menu</option>
                {dropdownOptions.menus.map(menu => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name}
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

            {/* Total Cooked Input */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Total Cooked *</span>
              <Input 
                type="number"
                name="total_cooked"
                value={formData.total_cooked}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="Enter total cooked"
                min="0"
                required
              />
            </Label>

            {/* Total Received Input */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Total Received *</span>
              <Input 
                type="number"
                name="total_received"
                value={formData.total_received}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="Enter total received"
                min="0"
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

export default EditLeftoverDegsModal;