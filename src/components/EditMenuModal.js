import React, { useState, useEffect } from 'react';
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
import { patch } from '../api/axios';

function EditMenuModal({ isOpen, onClose, onMenuUpdated, menuData }) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data when modal opens or menuData changes
  useEffect(() => {
    if (menuData) {
      setFormData({
        name: menuData.name || '',
        description: menuData.description || ''
      });
    }
  }, [menuData]);

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
      newErrors.name = 'Menu name is required';
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
      
      // Send PATCH request to update menu
      await patch(`/menu/${menuData.id}/`, formData);
      
      // Call the callback to refresh the menu list
      if (onMenuUpdated) {
        onMenuUpdated();
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error updating menu:', error);
      setErrors({ submit: 'Failed to update menu. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Edit Menu Item</ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label>
              <span>Menu Name</span>
              <Input 
                className="mt-1"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter menu name"
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
                placeholder="Enter menu description"
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
          <Button layout="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Menu'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}

export default EditMenuModal;