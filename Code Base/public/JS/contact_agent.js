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
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      // Show success message
      showAlert('success', 'Your message has been sent to the agent!');
      contactForm.reset();
      
      // Reset button
      submitBtn.disabled = false;
      btnText.textContent = 'Send Message';
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
});