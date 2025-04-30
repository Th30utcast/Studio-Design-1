// JS for mainlogged_page.html extracted from inline script blocks

function toggleFilters() {
    const filterSection = document.getElementById('filterOptions');
    const toggleBtn = document.getElementById('filterToggleBtn');
    const isVisible = filterSection.style.display === 'flex';
    filterSection.style.display = isVisible ? 'none' : 'flex';
    toggleBtn.innerHTML = isVisible ? '&#9881; ' + translations[document.documentElement.lang || 'en']['filters'] : '&#9881; ' + translations[document.documentElement.lang || 'en']['hide_filters'];
  }
  
  function closeModal() {
    const modal = document.getElementById('listingModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
  
  function updateMainImage(src) {
    const mainImage = document.querySelector('.main-image');
    if (mainImage) mainImage.src = src;
  }
  
  function contactAgentFor(listingId) {
    window.location.href = `contact_agent.html?listing=${listingId}`;
  }
  
  function scheduleViewing(listingId) {
    window.location.href = `appointment_page.html?listing=${listingId}`;
  }
  
  function addToFavorites(listingId) {
    alert('Add to favorites feature will be implemented soon!');
  }
  
  window.onclick = function(event) {
    const modal = document.getElementById('listingModal');
    if (event.target === modal) {
      closeModal();
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.getElementById("addListingBtn");
    const userType = localStorage.getItem("userType");
    if (userType === "seller") {
      addBtn.style.display = "inline-block";
      addBtn.addEventListener("click", () => {
        window.location.href = "add_listing.html";
      });
    }
  });  