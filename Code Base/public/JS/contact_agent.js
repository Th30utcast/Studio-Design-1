document.addEventListener('DOMContentLoaded', function() {
  // Get listing ID from URL or use default
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get('listing') || 'property1';
  
  // Set the listing ID in the hidden form field
  document.getElementById('listingId').value = listingId;

  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm(contactForm)) return;
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.innerHTML = '<span class="loading"></span> Sending...';
    
    // Show loading overlay
    document.getElementById("loadingOverlay").style.display = "flex";
    
    // Get user IDs - In a real app, these would come from your authentication system
    // For demo purposes, we're simulating this
    const currentUser = getCurrentUser(); // Get logged in user (buyer)
    const sellerInfo = getSellerInfo(listingId); // Get seller associated with this listing
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      // Hide loading overlay
      document.getElementById("loadingOverlay").style.display = "none";
      
      // Show success message
      showAlert('success', 'Your message has been sent to the agent!');
      
      // Store IDs for rating page
      sessionStorage.setItem('buyerId', currentUser.id);
      sessionStorage.setItem('sellerId', sellerInfo.id);
      sessionStorage.setItem('listingId', listingId);
      
      // Reset form
      contactForm.reset();
      
      // Reset button
      submitBtn.disabled = false;
      btnText.textContent = 'Send Message';
      
      // Redirect to rating page after a short delay
      setTimeout(() => {
        window.location.href = 'rate_seller.html';
      }, 1500);
    }, 1500);
  });
  
  function validateForm(form) {
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

    const emailField = form.querySelector('input[type="email"]');
    if (emailField && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
      emailField.style.borderColor = '#e63946';
      isValid = false;
      showAlert('error', 'Please enter a valid email address');
    }
    
    return isValid;
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
  
  // Mock function to get current user (buyer) - Replace with actual authentication
  function getCurrentUser() {
    // Normally, you would get this from your authentication system
    // For now, returning mock data
    return {
      id: localStorage.getItem('userId') || '60d21b4667d0d8992e610c85',
      name: localStorage.getItem('userName') || 'John Doe'
    };
  }
  
  // Mock function to get seller info based on listing - Replace with actual data fetch
  function getSellerInfo(listingId) {
    // In a real app, you would fetch this from your database
    // For now, returning mock data
    const mockSellers = {
      'property1': { id: '60d21b4667d0d8992e610c88', name: 'Alice Realtor' },
      'property2': { id: '60d21b4667d0d8992e610c89', name: 'Bob Agent' },
      'property3': { id: '60d21b4667d0d8992e610c90', name: 'Carol Broker' }
    };
    
    return mockSellers[listingId] || { id: '60d21b4667d0d8992e610c88', name: 'Alice Realtor' };
  }
});