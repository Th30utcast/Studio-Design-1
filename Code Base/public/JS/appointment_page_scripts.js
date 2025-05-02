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
    
    // Show loading overlay
    document.getElementById("loadingOverlay").style.display = "flex";

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
      // Hide loading overlay
      document.getElementById("loadingOverlay").style.display = "none";
      submitBtn.disabled = false;
      btnText.textContent = 'Schedule Viewing';
    }
  });

  async function loadPropertyDetails(listingId) {
    try {
      const res = await fetch(`/api/listings/${listingId}`);
      if (!res.ok) throw new Error("Listing not found");
      const listing = await res.json();
  
      // Debug the listing object to see its structure
      console.log("Raw listing data:", JSON.stringify(listing));
      
      // Handle each property individually and ensure they're properly stringified
      
      // Fix for location - this appears to be the main issue
      let locationText = "Unknown Location";
      if (listing.location) {
        // Check if location is an object or a string
        if (typeof listing.location === 'object') {
          // If it's an object, try to extract useful information
          if (listing.location.address) {
            locationText = listing.location.address;
          } else if (listing.location.city) {
            locationText = listing.location.city;
          } else if (listing.location.toString && listing.location.toString() !== '[object Object]') {
            locationText = listing.location.toString();
          } else {
            // If we can't extract anything useful, use any available location info
            const locationProps = Object.keys(listing.location);
            if (locationProps.length > 0) {
              const firstProp = locationProps[0];
              if (typeof listing.location[firstProp] === 'string') {
                locationText = listing.location[firstProp];
              }
            }
          }
        } else if (typeof listing.location === 'string') {
          // If it's already a string, use it directly
          locationText = listing.location;
        }
      }
      
      // Ensure other properties are properly handled
      const price = listing.price ? `€${Number(listing.price).toLocaleString()}` : 'Price on request';
      const bedrooms = typeof listing.bedrooms === 'number' ? listing.bedrooms : (listing.bedrooms || '?');
      const bathrooms = typeof listing.bathrooms === 'number' ? listing.bathrooms : (listing.bathrooms || '?');
      const apartmentType = typeof listing.apartmentType === 'string' ? listing.apartmentType : 'Property';
      const description = typeof listing.description === 'string' ? listing.description : 'No description available';
  
      // Set text content with proper string values
      document.getElementById('propertyLocation').textContent = locationText;
      document.getElementById('propertyPrice').textContent = price;
      document.getElementById('propertyDetails').textContent = `${bedrooms} Bedrooms | ${bathrooms} Bathrooms`;
      document.getElementById('propertyType').textContent = apartmentType;
      document.getElementById('propertyDescription').textContent = description;
      
      // For debugging
      console.log("Processed listing data:", {
        location: locationText, 
        price, 
        bedrooms, 
        bathrooms, 
        apartmentType, 
        description
      });
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