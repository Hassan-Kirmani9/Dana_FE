import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
  Textarea
} from '@windmill/react-ui';
import { post } from '../api/axios';

function CreateZoneModal({ isOpen, onClose, onZoneCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Zone name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare data for submission
      const dataToSubmit = {
        ...formData,
        // Convert empty strings to null for optional fields
        description: formData.description.trim() || null
      };
      
      // Send POST request to create zone
      await post('/zone/', dataToSubmit);
      
      // Reset form
      setFormData({
        name: '',
        description: ''
      });
      
      // Call the callback to refresh the zone list
      if (onZoneCreated) {
        onZoneCreated();
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error creating zone:', error);
      if (error.response && error.response.data) {
        // Display backend validation errors
        setErrors({ 
          ...errors,
          submit: 'Failed to create zone. Please check the form for errors.',
          ...error.response.data 
        });
      } else {
        setErrors({ submit: 'Failed to create zone. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
    setErrors({});
  };

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Add New Zone</ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label>
              <span>Zone Name *</span>
              <Input 
                className="mt-1"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter zone name"
              />
              {errors.name && (
                <span className="text-xs text-red-600">{errors.name}</span>
              )}
            </Label>
          </div>
          
          <div className="mb-4">
            <Label>
              <span>Description</span>
              <Textarea
                className="mt-1"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter zone description"
                rows="3"
              />
            </Label>
          </div>
          
          {errors.submit && (
            <div className="mb-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </form>
      </ModalBody>
      <ModalFooter>
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-row">
      
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Zone'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}

export default CreateZoneModal;