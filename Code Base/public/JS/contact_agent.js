document.addEventListener('DOMContentLoaded', function() {

  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get('listing') || 'property1';

  document.getElementById('listingId').value = listingId;

  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    

    if (!validateForm(contactForm)) return;
    

    submitBtn.disabled = true;
    btnText.innerHTML = '<span class="loading"></span> Sending...';

    document.getElementById("loadingOverlay").style.display = "flex";
    

    const currentUser = getCurrentUser(); 
    const sellerInfo = getSellerInfo(listingId); 
    

    setTimeout(() => {
 
      document.getElementById("loadingOverlay").style.display = "none";
      

      showAlert('success', 'Your message has been sent to the agent!');
      

      sessionStorage.setItem('buyerId', currentUser.id);
      sessionStorage.setItem('sellerId', sellerInfo.id);
      sessionStorage.setItem('listingId', listingId);
      

      contactForm.reset();
      

      submitBtn.disabled = false;
      btnText.textContent = 'Send Message';
      

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
  

  function getCurrentUser() {

    return {
      id: localStorage.getItem('userId') || '60d21b4667d0d8992e610c85',
      name: localStorage.getItem('userName') || 'John Doe'
    };
  }
  
 
  function getSellerInfo(listingId) {

    const mockSellers = {
      'property1': { id: '60d21b4667d0d8992e610c88', name: 'Alice Realtor' },
      'property2': { id: '60d21b4667d0d8992e610c89', name: 'Bob Agent' },
      'property3': { id: '60d21b4667d0d8992e610c90', name: 'Carol Broker' }
    };
    
    return mockSellers[listingId] || { id: '60d21b4667d0d8992e610c88', name: 'Alice Realtor' };
  }
});