import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
} from '@windmill/react-ui';
import { post } from '../api/axios';

function CreateUnitModal({ isOpen, onClose, onUnitCreated }) {
  const [formData, setFormData] = useState({
    name: ''
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
      newErrors.name = 'Unit name is required';
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
      
      // Send POST request to create unit
      await post('/unit/', formData);
      
      // Reset form
      setFormData({
        name: ''
      });
      
      // Call the callback to refresh the unit list
      if (onUnitCreated) {
        onUnitCreated();
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error creating unit:', error);
      if (error.response && error.response.data) {
        // Display backend validation errors
        setErrors({ 
          ...errors,
          submit: 'Failed to create unit. Please check the form for errors.',
          ...error.response.data 
        });
      } else {
        setErrors({ submit: 'Failed to create unit. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: ''
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
      <ModalHeader>Add New Unit</ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label>
              <span>Unit Name *</span>
              <Input 
                className="mt-1"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter unit name (e.g., Kg, Liter)"
              />
              {errors.name && (
                <span className="text-xs text-red-600">{errors.name}</span>
              )}
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
            {isSubmitting ? 'Saving...' : 'Save Unit'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}

export default CreateUnitModal;