document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const listingId = urlParams.get('listing');
  
    if (listingId) {
      document.getElementById('listingId').value = listingId;
      loadPropertyDetails(listingId);
    }
  
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('viewingDate').min = today;
    document.getElementById('viewingTime').min = '09:00';
    document.getElementById('viewingTime').max = '18:00';
  
    const viewingForm = document.getElementById('viewingForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
  
    viewingForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (!validateViewingForm(viewingForm)) return;
  
      submitBtn.disabled = true;
      btnText.innerHTML = '<span class="loading"></span> Scheduling...';
  
      try {
        const formData = new FormData(viewingForm);
        const jsonData = {};
        formData.forEach((value, key) => { jsonData[key] = value });
        jsonData.viewingDateTime = `${jsonData.viewingDate}T${jsonData.viewingTime}`;
        await simulateApiCall('/api/schedule-viewing', jsonData);
        showAlert('success', 'Viewing scheduled successfully! The agent will confirm shortly.');
        viewingForm.reset();
      } catch (error) {
        showAlert('error', 'Failed to schedule viewing. Please try again.');
        console.error('Error:', error);
      } finally {
        submitBtn.disabled = false;
        btnText.textContent = 'Schedule Viewing';
      }
    });
  
    async function loadPropertyDetails(listingId) {
      try {
        const res = await fetch(`/api/listings/${listingId}`);
        if (!res.ok) throw new Error("Listing not found");
        const listing = await res.json();
    
        document.getElementById('propertyLocation').textContent = listing.location || 'Unknown';
        document.getElementById('propertyPrice').textContent = `€${listing.price?.toLocaleString() || 'N/A'}`;
        document.getElementById('propertyDetails').textContent = `${listing.bedrooms || '?'} Bedrooms | ${listing.bathrooms || '?'} Bathrooms`;
    
        if (listing.apartmentType) {
          document.getElementById('propertyType').textContent = listing.apartmentType;
        }
    
        if (listing.description) {
          document.getElementById('propertyDescription').textContent = listing.description;
        }
      } catch (err) {
        console.error("Error loading listing:", err);
        document.getElementById('propertyLocation').textContent = 'Listing not found.';
        document.getElementById('propertyPrice').textContent = '';
        document.getElementById('propertyDetails').textContent = '';
        document.getElementById('propertyType').textContent = '';
        document.getElementById('propertyDescription').textContent = '';
      }
    }
    
  
    function validateViewingForm(form) {
      let isValid = true;
      const requiredFields = form.querySelectorAll('[required]');
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#e63946';
          isValid = false;
        } else {
          field.style.borderColor = '#ddd';
        }
      });
  
      const viewingDate = new Date(form.querySelector('#viewingDate').value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (viewingDate < today) {
        showAlert('error', 'Please select a future date');
        isValid = false;
      }
  
      const emailField = form.querySelector('input[type="email"]');
      if (emailField && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        emailField.style.borderColor = '#e63946';
        isValid = false;
        showAlert('error', 'Please enter a valid email address');
      }
  
      return isValid;
    }
  
    function simulateApiCall(url, data) {
      console.log('Simulating submission to:', url, data);
      return new Promise((resolve) => setTimeout(resolve, 1500));
    }
  
    function showAlert(type, message) {
      const alertDiv = document.createElement('div');
      alertDiv.className = `alert alert-${type}`;
      alertDiv.textContent = message;
      document.body.appendChild(alertDiv);
      setTimeout(() => {
        alertDiv.style.animation = 'fadeOut 0.3s ease-in-out';
        setTimeout(() => alertDiv.remove(), 300);
      }, 3000);
    }
  });
  