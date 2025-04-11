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

const EditDistributionModal = ({
  isOpen,
  onClose,
  miqaatId,
  distributionData,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    miqaat: miqaatId,
    zone: '',
    counter_packing: '',
    ibadullah_count: '',
    mumin_count: ''
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    zones: [],
    counter_packings: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form data when distribution data changes
  useEffect(() => {
    if (distributionData) {
      setFormData({
        miqaat: miqaatId,
        zone: distributionData.zone ? distributionData.zone.id : '',
        counter_packing: distributionData.counter_packing ? distributionData.counter_packing.id : '',
        ibadullah_count: distributionData.ibadullah_count || '',
        mumin_count: distributionData.mumin_count || ''
      });
    }
  }, [distributionData, miqaatId]);

  // Fetch dropdown options
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const [zonesRes, counterPackingsRes] = await Promise.all([
          get('/zone/list/'),
          get(`/counter-packing/${miqaatId}`)
        ]);

        setDropdownOptions({
          zones: zonesRes,
          counter_packings: counterPackingsRes.counter_packing
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
      const requiredFields = ['zone', 'counter_packing', 'ibadullah_count', 'mumin_count'];
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
        counter_packing: parseInt(formData.counter_packing),
        ibadullah_count: parseInt(formData.ibadullah_count),
        mumin_count: parseInt(formData.mumin_count)
      };

      // Submit the form
      await patch(`/distribution/${distributionData.id}/`, submissionData);

      // Show success toast
      toast.success('Distribution record updated successfully');

      // Call success callback
      onSuccess();

      // Close the modal
      onClose();
    } catch (err) {
      console.error('Error updating distribution record:', err);
      setError(err.response?.data?.message || 'Failed to update distribution record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Edit Distribution Record</ModalHeader>
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

           

            {/* Ibadullah Count Input */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Ibadullah Count *</span>
              <Input
                type="number"
                name="ibadullah_count"
                value={formData.ibadullah_count}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="Enter Ibadullah count"
                min="0"
                required
              />
            </Label>

            {/* Mumin Count Input */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Mumin Count *</span>
              <Input
                type="number"
                name="mumin_count"
                value={formData.mumin_count}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="Enter Mumin count"
                min="0"
                required
              />
            </Label>
          </div>
           {/* Counter Packing Dropdown */}
           <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Counter Packing *</span>
              <Select
                name="counter_packing"
                value={formData.counter_packing}
                onChange={handleInputChange}
                className="mt-1"
                required
              >
                <option value="">Select Counter Packing</option>
                {dropdownOptions.counter_packings.map(counterPacking => (
                  <option key={counterPacking.id} value={counterPacking.id}>
                    Zone Name: {counterPacking.zone_name},  Quantity: {counterPacking.quantity} (Fill: {counterPacking.filled_percentage}%)
                  </option>
                ))}
              </Select>
            </Label>
        </form>
      </ModalBody>
      <ModalFooter>

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

export default EditDistributionModal;