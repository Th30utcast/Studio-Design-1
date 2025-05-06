function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  
  document.addEventListener('DOMContentLoaded', function () {

    console.log("Rating script loaded!");
  

    const token = localStorage.getItem('token');
  
    if (!token) {
      console.error("Token not found in localStorage");
      showAlert('error', 'You must be logged in to submit a rating.');
      return;
    }
  

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
  

    const sellerId = sessionStorage.getItem('sellerId') || getUrlParam('sellerId');
    const listingId = sessionStorage.getItem('listingId') || getUrlParam('listingId');
  

    console.log("Loaded IDs:", { buyerId, sellerId, listingId });
  

    document.getElementById('buyerId').value = buyerId;
    document.getElementById('sellerId').value = sellerId;
    document.getElementById('listingId').value = listingId;
  
    const ratingForm = document.getElementById('ratingForm');
    const submitBtn = document.getElementById('submitBtn');
  
    ratingForm.addEventListener('submit', async function (e) {
      e.preventDefault();
  

      if (!validateForm(ratingForm)) return;
  

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="loading"></span> Submitting...';
      document.getElementById("loadingOverlay").style.display = "flex";
  
      try {

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
  

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Rating submission failed');
        }
  

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
  

    function validateForm(form) {
      if (!form.querySelector('input[name="rating"]:checked')) {
        showAlert('error', 'Please select a star rating');
        return false;
      }
      return true;
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