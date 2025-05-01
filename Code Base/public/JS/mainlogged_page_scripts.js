document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const dropdownMenu = document.getElementById("dropdownMenu");

  if (menuToggle && dropdownMenu) {
    menuToggle.addEventListener("click", () => {
      dropdownMenu.style.display = dropdownMenu.style.display === "flex" ? "none" : "flex";
    });

    document.addEventListener("click", (e) => {
      if (!dropdownMenu.contains(e.target) && e.target !== menuToggle) {
        dropdownMenu.style.display = "none";
      }
    });
  }

  const userType = localStorage.getItem("userType");
  const addListingMenuItem = document.getElementById("addListingMenuItem");
  
  if (userType === "seller" && addListingMenuItem) {
    addListingMenuItem.style.display = "block";
  }
  

  // Search Button Handler
  const searchButton = document.getElementById("searchButton");
  if (searchButton) {
    searchButton.addEventListener("click", () => {
      const filters = {
        country: document.getElementById("country")?.value.trim(),
        state: document.getElementById("state")?.value.trim(),
        city: document.getElementById("city")?.value.trim(),
        postalCode: document.getElementById("zip")?.value.trim(),
        minPrice: document.getElementById("minPrice")?.value,
        maxPrice: document.getElementById("maxPrice")?.value,
        apartmentType: document.getElementById("apartmentType")?.value,
        bedrooms: document.getElementById("rooms")?.value,
        duration: document.getElementById("duration")?.value,
        listingType: [...document.getElementsByName("listingType")].find(r => r.checked)?.value === "buy" ? "purchase" : "rent",
        verified: document.getElementById("verified")?.checked
      };
      fetchListings(filters);
    });
  }

  fetchListings(); // Initial load
});

// Toggles the rent duration field visibility
function toggleDuration() {
  const rentRadio = document.querySelector('input[name="listingType"][value="rent"]');
  const durationField = document.getElementById("duration");
  if (rentRadio && durationField) {
    durationField.style.display = rentRadio.checked ? "block" : "none";
    if (!rentRadio.checked) durationField.value = "";
  }
}

// Fetch and render listings based on filters
async function fetchListings(filters = {}) {
  try {
    const resultsContainer = document.getElementById("searchResults");
    if (!resultsContainer) return;

    const params = new URLSearchParams();
    if (filters.country) params.append("country", filters.country);
    if (filters.state) params.append("state", filters.state);
    if (filters.city) params.append("city", filters.city);
    if (filters.postalCode) params.append("postalCode", filters.postalCode);
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
    if (filters.apartmentType) params.append("apartmentType", filters.apartmentType);
    if (filters.bedrooms) params.append("bedrooms", filters.bedrooms);
    if (filters.duration) params.append("duration", filters.duration);
    if (filters.listingType) params.append("listingType", filters.listingType);
    if (filters.verified) params.append("verified", true);

    const res = await fetch(`/api/listings?${params.toString()}`);
    const listings = await res.json();

    resultsContainer.innerHTML = "";

    if (!Array.isArray(listings) || listings.length === 0) {
      resultsContainer.innerHTML = "<p style='text-align:center;'>No listings found.</p>";
      return;
    }

    listings.forEach(listing => {
      const card = document.createElement("div");
      card.className = "property-card";
      card.dataset.listingData = JSON.stringify(listing);
      card.innerHTML = `
        <img src="${listing.photos?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}" class="property-image" />
        <div class="property-info">
          <h3>${listing.location?.city || "Unknown City"}, ${listing.location?.country || ""}</h3>
          <div class="property-price">€${listing.price?.toLocaleString() || "N/A"}</div>
          <div class="property-details">${listing.bedrooms || "?"} beds | ${listing.bathrooms || "?"} baths</div>
          <p>${listing.description?.substring(0, 100) || "No description"}${listing.description?.length > 100 ? "..." : ""}</p>
        </div>
      `;
      card.addEventListener("click", () => openModal(listing));
      resultsContainer.appendChild(card);
    });

  } catch (err) {
    console.error("Failed to load listings:", err);
  }
}

// Modal display functions
function openModal(listing) {
  const modal = document.getElementById("listingModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");

  if (!modal || !modalTitle || !modalBody) return;

  modalTitle.textContent = listing.location?.city || 'Property Details';
  let modalContent = `
    <img src="${listing.photos?.[0] || 'https://via.placeholder.com/800x500?text=Property+Image'}" class="main-image">
  `;

  if (listing.photos?.length > 1) {
    modalContent += '<div class="modal-gallery">';
    listing.photos.forEach(photo => {
      modalContent += `<img src="${photo}" onclick="updateMainImage(this.src)">`;
    });
    modalContent += '</div>';
  }

  modalContent += `
    <div class="listing-details">
      <div class="detail-item"><div class="detail-value">€${listing.price?.toLocaleString() || 'N/A'}</div><div class="detail-label">Price</div></div>
      <div class="detail-item"><div class="detail-value">${listing.bedrooms || '?'}</div><div class="detail-label">Bedrooms</div></div>
      <div class="detail-item"><div class="detail-value">${listing.bathrooms || '?'}</div><div class="detail-label">Bathrooms</div></div>
      <div class="detail-item"><div class="detail-value">${listing.size || 'N/A'}</div><div class="detail-label">Size</div></div>
      ${listing.duration ? `<div class="detail-item"><div class="detail-value">${listing.duration}</div><div class="detail-label">Duration</div></div>` : ''}
    </div>

    <h4>Description</h4>
    <p class="listing-description">${listing.description || 'No description available.'}</p>

    <h4>Location</h4>
    <p class="listing-description">
      ${listing.location?.street || ""}, 
      ${listing.location?.city || ""}, 
      ${listing.location?.state || ""}, 
      ${listing.location?.postalCode || ""}, 
      ${listing.location?.country || ""}
    </p>

    <div class="action-buttons">
      <button class="action-button btn-primary" onclick="contactAgentFor('${listing._id}')">Contact Agent</button>
      <button class="action-button btn-secondary" onclick="scheduleViewing('${listing._id}')">Schedule Viewing</button>
      <button class="action-button btn-secondary" onclick="addToFavorites('${listing._id}')">Add to Favorites</button>
    </div>
  `;

  modalBody.innerHTML = modalContent;
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById("listingModal");
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
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
  alert("Add to favorites feature will be implemented soon!");
}

window.onclick = function (event) {
  const modal = document.getElementById("listingModal");
  if (event.target === modal) {
    closeModal();
  }
};
