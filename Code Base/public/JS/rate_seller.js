function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  
  document.addEventListener('DOMContentLoaded', function () {
    // Debug: Verify script loaded
    console.log("Rating script loaded!");
  
    // Get token from localStorage
    const token = localStorage.getItem('token');
  
    if (!token) {
      console.error("Token not found in localStorage");
      showAlert('error', 'You must be logged in to submit a rating.');
      return;
    }
  
    // Decode token to get buyerId
    let buyerId;
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      buyerId = payload.user.id;
      console.log("Decoded buyerId from token:", buyerId);
    } catch (err) {
      console.error("Failed to decode token:", err);
      showAlert('error', 'Authentication failed. Please log in again.');
      return;
    }
  
    // Get sellerId and listingId
    const sellerId = sessionStorage.getItem('sellerId') || getUrlParam('sellerId');
    const listingId = sessionStorage.getItem('listingId') || getUrlParam('listingId');
  
    // Debug: Check IDs
    console.log("Loaded IDs:", { buyerId, sellerId, listingId });
  
    // Set hidden field values
    document.getElementById('buyerId').value = buyerId;
    document.getElementById('sellerId').value = sellerId;
    document.getElementById('listingId').value = listingId;
  
    const ratingForm = document.getElementById('ratingForm');
    const submitBtn = document.getElementById('submitBtn');
  
    ratingForm.addEventListener('submit', async function (e) {
      e.preventDefault();
  
      // Validate form
      if (!validateForm(ratingForm)) return;
  
      // UI Loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="loading"></span> Submitting...';
      document.getElementById("loadingOverlay").style.display = "flex";
  
      try {
        // REAL API CALL IMPLEMENTATION
        const response = await fetch('/ratings/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            buyer: buyerId,
            seller: sellerId,
            listing: listingId,
            stars: parseInt(document.querySelector('input[name="rating"]:checked').value),
            comment: document.getElementById('comment').value
          })
        });
  
        // Handle non-2xx responses
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Rating submission failed');
        }
  
        // Success handling
        showAlert('success', 'Rating submitted successfully!');
        sessionStorage.removeItem('buyerId');
        sessionStorage.removeItem('sellerId');
        sessionStorage.removeItem('listingId');
  
        setTimeout(() => {
          window.location.href = 'mainlogged_page.html';
        }, 1500);
  
      } catch (error) {
        console.error('Rating error:', error);
        showAlert('error', error.message || 'Failed to submit rating');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Rating';
        document.getElementById("loadingOverlay").style.display = "none";
      }
    });
  
    function resetButton() {
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Rating';
      document.getElementById("loadingOverlay").style.display = "none";
    }
  
    // Form validation
    function validateForm(form) {
      if (!form.querySelector('input[name="rating"]:checked')) {
        showAlert('error', 'Please select a star rating');
        return false;
      }
      return true;
    }
  
    // Alert notification
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