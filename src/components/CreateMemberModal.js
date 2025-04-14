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
import { post } from '../api/axios';
import toast from 'react-hot-toast';

function CreateMemberModal({ 
  isOpen, 
  onClose, 
  onMemberCreated 
}) {
  const [formData, setFormData] = useState({
    its: '',
    full_name: '',
    contact_number: '',
    whatsapp_number: '',
    email_address: '',
    mohalla: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  
  useEffect(() => {
    if (isOpen) {
      setFormData({
        its: '',
        full_name: '',
        contact_number: '',
        whatsapp_number: '',
        email_address: '',
        mohalla: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.its.trim()) {
      newErrors.its = 'ITS is required';
    } else if (formData.its.length > 8) {
      newErrors.its = 'ITS cannot exceed 8 characters';
    }
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (formData.email_address && !/^\S+@\S+\.\S+$/.test(formData.email_address)) {
      newErrors.email_address = 'Invalid email format';
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
      
      
      const dataToSubmit = {
        ...formData,
        
        contact_number: formData.contact_number || null,
        whatsapp_number: formData.whatsapp_number || null,
        email_address: formData.email_address || null,
        mohalla: formData.mohalla || null
      };
      
      
      const response = await post('/member/', dataToSubmit);
      
      
      toast.success('Member created successfully');
      
      
      if (onMemberCreated) {
        onMemberCreated();
      }
      
      
      onClose();
    } catch (error) {
      console.error('Error creating member:', error);
      
      
      if (error && typeof error === 'object') {
        const backendErrors = error;

        
        if (typeof backendErrors === 'object' && !Array.isArray(backendErrors)) {
          const newErrors = {};
          Object.keys(backendErrors).forEach((key) => {
            const errorMessage = backendErrors[key];
            
            if (Array.isArray(errorMessage)) {
              newErrors[key] = errorMessage[0]?.charAt(0).toUpperCase() + errorMessage[0]?.slice(1) || 'An error occurred';
            } else if (typeof errorMessage === 'string') {
              newErrors[key] = errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);
            } else {
              newErrors[key] = 'An error occurred';
            }
          });
          setErrors(newErrors);
        } else if (typeof backendErrors === 'string') {
          
          setErrors({ submit: backendErrors.charAt(0).toUpperCase() + backendErrors.slice(1) });
        } else {
          setErrors({ submit: 'An unexpected error occurred. Please try again.' });
        }
      } else {
        
        setErrors({ submit: 'Failed to connect to the server. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Add New Member</ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {}
            <div className="mb-4">
              <Label>
                <span>ITS Number *</span>
                <Input
                  className="mt-1"
                  name="its"
                  value={formData.its}
                  onChange={handleChange}
                  placeholder="Enter ITS number"
                  maxLength={8}
                />
                {errors.its && (
                  <span className="text-xs text-red-600">{errors.its}</span>
                )}
              </Label>
            </div>
            
            {}
            <div className="mb-4">
              <Label>
                <span>Full Name *</span>
                <Input 
                  className="mt-1"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                />
                {errors.full_name && (
                  <span className="text-xs text-red-600">{errors.full_name}</span>
                )}
              </Label>
            </div>

            {}
            <div className="mb-4">
              <Label>
                <span>Contact Number</span>
                <Input 
                  className="mt-1"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="Enter contact number"
                />
                {errors.contact_number && (
                  <span className="text-xs text-red-600">{errors.contact_number}</span>
                )}
              </Label>
            </div>

            {}
            <div className="mb-4">
              <Label>
                <span>WhatsApp Number</span>
                <Input 
                  className="mt-1"
                  name="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={handleChange}
                  placeholder="Enter WhatsApp number"
                />
                {errors.whatsapp_number && (
                  <span className="text-xs text-red-600">{errors.whatsapp_number}</span>
                )}
              </Label>
            </div>
          </div>

          {}
          <div className="mb-4">
            <Label>
              <span>Email Address</span>
              <Input 
                className="mt-1"
                name="email_address"
                value={formData.email_address}
                onChange={handleChange}
                placeholder="Enter email address"
                type="email"
              />
              {errors.email_address && (
                <span className="text-xs text-red-600">{errors.email_address}</span>
              )}
            </Label>
          </div>

          {}
          <div className="mb-4">
            <Label>
              <span>Mohalla</span>
              <Textarea 
                className="mt-1"
                name="mohalla"
                value={formData.mohalla}
                onChange={handleChange}
                placeholder="Enter mohalla details"
                rows="3"
              />
              {errors.mohalla && (
                <span className="text-xs text-red-600">{errors.mohalla}</span>
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
            {isSubmitting ? 'Creating...' : 'Create Member'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}

export default CreateMemberModal;