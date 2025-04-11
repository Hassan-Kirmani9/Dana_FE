import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
  Select,
  Textarea
} from '@windmill/react-ui';
import { patch, get } from '../api/axios';

function EditMemberModal({ isOpen, onClose, onMemberUpdated, memberData }) {
  const [formData, setFormData] = useState({
    its: '',
    full_name: '',
    zone: '',
    miqaat: '',
    contact_number: '',
    whatsapp_number: '',
    email_address: '',
    mohalla: '',
    counter: ''
  });
  
  const [zones, setZones] = useState([]);
  const [miqaats, setMiqaats] = useState([]);
  const [counters, setCounters] = useState([]);
  const [defaultMiqaat, setDefaultMiqaat] = useState(null);
  const [defaultZone, setDefaultZone] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // This function finds an ID by name in a list of objects
  const findIdByName = (name, list) => {
    if (!name || !list || list.length === 0) return '';
    
    const item = list.find(item => item.name === name);
    return item ? item.id : '';
  };

  // Fetch options data when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchOptionsData();
    }
  }, [isOpen]);

  const fetchOptionsData = async () => {
    setIsLoadingOptions(true);
    try {
      // Fetch all data in parallel
      const [zonesResponse, miqaatsResponse, countersResponse] = await Promise.all([
        get('/zone/list/'),
        get('/miqaat/list/'),
        get('/counter/list/')
      ]);
      
      setZones(zonesResponse);
      setMiqaats(miqaatsResponse);
      setCounters(countersResponse);
    
      // Set default values
      if (zonesResponse && zonesResponse.length > 0) {
        setDefaultZone(zonesResponse[0]);
      }
      
      if (miqaatsResponse && miqaatsResponse.length > 0) {
        setDefaultMiqaat(miqaatsResponse[0]);
      }
      
      // Only now initialize the form with member data
      if (memberData) {
        initializeFormWithMemberData(memberData, zonesResponse, miqaatsResponse, countersResponse);
      }
    } catch (error) {
      console.error('Error fetching options data:', error);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // Initialize form data with member data and options
  const initializeFormWithMemberData = (data, zonesList, miqaatsList, countersList) => {
    console.log("Initializing form with data:", data);
    
    let zoneId = '';
    let miqaatId = '';
    let counterId = '';
    
    // Handle zone
    if (data.zone && data.zone.id) {
      zoneId = data.zone.id;
    } else if (data.zone_name) {
      zoneId = findIdByName(data.zone_name, zonesList);
    }
    
    // Handle miqaat
    if (data.miqaat && data.miqaat.id) {
      miqaatId = data.miqaat.id;
    } else if (data.miqaat_name) {
      miqaatId = findIdByName(data.miqaat_name, miqaatsList);
    }
    
    // Handle counter
    if (data.counter && data.counter.id) {
      counterId = data.counter.id;
    } else if (data.counter_name) {
      counterId = findIdByName(data.counter_name, countersList);
    }
    
    console.log("Setting IDs - Zone:", zoneId, "Miqaat:", miqaatId, "Counter:", counterId);
    
    setFormData({
      its: data.its || '',
      full_name: data.full_name || '',
      zone: zoneId,
      miqaat: miqaatId || (defaultMiqaat ? defaultMiqaat.id : ''),
      contact_number: data.contact_number || '',
      whatsapp_number: data.whatsapp_number || '',
      email_address: data.email_address || '',
      mohalla: data.mohalla || '',
      counter: counterId
    });
    
    setIsInitialized(true);
  };

  // Watch for changes in memberData
  useEffect(() => {
    if (memberData && zones.length > 0 && miqaats.length > 0 && counters.length > 0 && !isInitialized) {
      initializeFormWithMemberData(memberData, zones, miqaats, counters);
    }
  }, [memberData, zones, miqaats, counters, isInitialized]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsInitialized(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to ${value}`);
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
    
    if (!formData.zone) {
      newErrors.zone = 'Zone is required';
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
      
      // For debugging
      console.log("Submitting form with data:", formData);
      
      // Prepare data for submission
      const dataToSubmit = {
        ...formData,
        // Convert empty strings to null for optional fields
        contact_number: formData.contact_number || null,
        whatsapp_number: formData.whatsapp_number || null,
        email_address: formData.email_address || null,
        mohalla: formData.mohalla || null,
        counter: formData.counter || null,
        // Always include zone, using default if none selected
        zone: formData.zone || (defaultZone ? defaultZone.id : ''),
        // Always include miqaat, using default if none selected
        miqaat: formData.miqaat || (defaultMiqaat ? defaultMiqaat.id : null)
      };
      
      // Send PATCH request to update member
      await patch(`/member/${memberData.id}/`, dataToSubmit);
      
      // Call the callback to refresh the member list
      if (onMemberUpdated) {
        onMemberUpdated();
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error updating member:', error);
      if (error.response && error.response.data) {
        // Display backend validation errors
        setErrors({ 
          ...errors,
          submit: 'Failed to update member. Please check the form for errors.',
          ...error.response.data 
        });
      } else {
        setErrors({ submit: 'Failed to update member. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Edit Member</ModalHeader>
      <ModalBody>
        {isLoadingOptions ? (
          <div className="text-center py-4">
            <p>Loading data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* ITS Number */}
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
              
              {/* Full Name */}
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

              {/* Zone - Required */}
              <div className="mb-4">
                <Label>
                  <span>Zone *</span>
                  <Select
                    className="mt-1"
                    name="zone"
                    value={formData.zone}
                    onChange={handleChange}
                  >
                    <option value="">Select Zone</option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={String(zone.id)}>
                        {zone.name}
                      </option>
                    ))}
                  </Select>
                  {errors.zone && (
                    <span className="text-xs text-red-600">{errors.zone}</span>
                  )}
                </Label>
              </div>
              
              {/* Miqaat - Disabled but showing default value */}
              <div className="mb-4">
                <Label>
                  <span>Miqaat</span>
                  <Select
                    className="mt-1"
                    name="miqaat"
                    value={formData.miqaat}
                    onChange={handleChange}
                    disabled={true}
                  >
                    <option value="">Select Miqaat</option>
                    {miqaats.map((miqaat) => (
                      <option key={miqaat.id} value={String(miqaat.id)}>
                        {miqaat.miqaat_name}
                      </option>
                    ))}
                  </Select>
                </Label>
              </div>
              
              {/* Counter */}
              <div className="mb-4">
                <Label>
                  <span>Counter (Optional)</span>
                  <Select
                    className="mt-1"
                    name="counter"
                    value={formData.counter}
                    onChange={handleChange}
                  >
                    <option value="">Select counter</option>
                    {counters.map((counter) => (
                      <option key={counter.id} value={String(counter.id)}>
                        {counter.name}
                      </option>
                    ))}
                  </Select>
                </Label>
              </div>

              {/* Contact Number */}
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
                </Label>
              </div>

              {/* WhatsApp Number */}
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
                </Label>
              </div>

              {/* Email Address */}
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
            </div>

            {/* Mohalla - Full width */}
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
              </Label>
            </div>
            
            {/* Display backend errors if any */}
            {errors.submit && (
              <div className="mb-4">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </form>
        )}
      </ModalBody>
      <ModalFooter>
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-row">
          <Button layout="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || isLoadingOptions}
          >
            {isSubmitting ? 'Updating...' : 'Update Member'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}

export default EditMemberModal;