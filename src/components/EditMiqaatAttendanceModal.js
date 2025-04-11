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
  HelperText
} from '@windmill/react-ui';
import { get, patch } from '../api/axios';
import toast from 'react-hot-toast';

const EditMiqaatAttendanceModal = ({ 
  isOpen, 
  onClose, 
  miqaatId, 
  attendanceData,
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    miqaat: miqaatId,
    zone: '',
    member: '',
    counter: '',
    checkin_time: '',
    checkout_time: ''
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    zones: [],
    members: [],
    counters: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form data when attendance data changes
  useEffect(() => {
    if (attendanceData) {
      setFormData({
        miqaat: miqaatId,
        zone: attendanceData.zone ? attendanceData.zone.id : '',
        member: attendanceData.member ? attendanceData.member.id : '',
        counter: attendanceData.counter ? attendanceData.counter.id : '',
        checkin_time: attendanceData.checkin_time || '',
        checkout_time: attendanceData.checkout_time || ''
      });
    }
  }, [attendanceData, miqaatId]);
  
  // Fetch dropdown options
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const [zonesRes, membersRes, countersRes] = await Promise.all([
          get('/zone/list/'),
          get('/member/list/'),
          get('/counter/list/')
        ]);

        setDropdownOptions({
          zones: zonesRes,
          members: membersRes,
          counters: countersRes
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

  const validateTimes = (checkin, checkout) => {
    if (!checkin || !checkout) return true; 
    
    const today = new Date().toISOString().split('T')[0]; 
    const checkinDate = new Date(`${today}T${checkin}`);
    const checkoutDate = new Date(`${today}T${checkout}`);
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      const requiredFields = ['zone', 'member', 'counter', 'checkin_time', 'checkout_time'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      // Validate that counter is a valid integer
      const counterValue = parseInt(formData.counter, 10);
      if (isNaN(counterValue) || counterValue <= 0) {
        setError('Please select a valid counter');
        setIsSubmitting(false);
        return;
      }

      // Validate time range
      if (!validateTimes(formData.checkin_time, formData.checkout_time)) {
        setError('Invalid time range');
        setIsSubmitting(false);
        return;
      }

      // Prepare submission data
      const submissionData = {
        ...formData,
        miqaat: parseInt(miqaatId),
        zone: parseInt(formData.zone),
        member: parseInt(formData.member),
        counter: counterValue 
      };

      // Submit the form
      await patch(`/miqaat-attendance/${attendanceData.id}/`, submissionData);
      
      // Show success toast
      toast.success('Attendance record updated successfully');
      
      // Call success callback
      onSuccess();
      
      // Close the modal
      onClose();
    } catch (err) {
      console.error('Error updating attendance record:', err);
      setError(err.response?.data?.message || 'Failed to update attendance record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Edit Attendance Record</ModalHeader>
      <ModalBody>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Member Dropdown */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Member *</span>
              <Select
                name="member"
                value={formData.member}
                onChange={handleInputChange}
                className="mt-1"
                required
              >
                <option value="">Select Member</option>
                {dropdownOptions.members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.full_name || member.its || `Member #${member.id}`}
                  </option>
                ))}
              </Select>
            </Label>

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

            {/* Counter Dropdown */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Counter *</span>
              <Select
                name="counter"
                value={formData.counter}
                onChange={handleInputChange}
                className="mt-1"
                required
              >
                <option value="">Select Counter</option>
                {dropdownOptions.counters.map(counter => (
                  <option key={counter.id} value={counter.id}>
                    {counter.name || `Counter #${counter.id}`}
                  </option>
                ))}
              </Select>
            </Label>

            {/* Check-in Time */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Check-in Time *</span>
              <Input
                type="time"
                name="checkin_time"
                value={formData.checkin_time}
                onChange={handleInputChange}
                className="mt-1"
                required
              />
            </Label>

            {/* Check-out Time */}
            <Label className="block text-sm col-span-1 md:col-span-2">
              <span className="text-gray-700 dark:text-gray-400">Check-out Time *</span>
              <Input
                type="time"
                name="checkout_time"
                value={formData.checkout_time}
                onChange={handleInputChange}
                className="mt-1"
                required
              />
              <HelperText>
                Check-out time can be before check-in time if spanning multiple days
              </HelperText>
            </Label>
          </div>
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

export default EditMiqaatAttendanceModal;