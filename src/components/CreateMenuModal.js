import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
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
import { toast } from 'react-hot-toast';

const CreateMenuModal = ({ 
  isOpen, 
  onClose,
  onMenuCreated
}) => {
  const history = useHistory();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Menu name is required');
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare submission data
      const submissionData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null
      };

      // Submit to backend
      const response = await post('/menu/', submissionData);
      
      // Show success toast
      toast.success('Menu created successfully');
      
      // Close the modal first
      onClose();
      
      // Trigger list refresh
      onMenuCreated();
      
      // Then redirect to menu list
      history.push('/app/menu');
    } catch (error) {
      console.error('Error creating menu:', error);
      toast.error(error.response?.data?.message || 'Failed to create menu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Create New Menu</ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit}>
          <Label className="block mb-4">
            <span>Menu Name</span>
            <Input 
              className="mt-1"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter menu name" 
              required
            />
          </Label>

          <Label className="block">
            <span>Description (Optional)</span>
            <Textarea 
              className="mt-1"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Enter menu description" 
            />
          </Label>
        </form>
      </ModalBody>
      <ModalFooter>
        <div className="hidden sm:block">
          <Button layout="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
        <div className="hidden sm:block">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Menu'}
          </Button>
        </div>
        
        {/* Mobile buttons */}
        <div className="w-full sm:hidden">
          <Button 
            block 
            size="large" 
            layout="outline" 
            onClick={onClose}
            className="mb-4"
          >
            Cancel
          </Button>
          <Button 
            block 
            size="large" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Menu'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default CreateMenuModal;