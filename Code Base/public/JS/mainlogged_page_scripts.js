// ==================== FILTER & MODAL FUNCTIONS ====================
function toggleFilters() {
  const filterSection = document.getElementById("filterOptions");
  const toggleBtn = document.getElementById("filterToggleBtn");
  if (!filterSection || !toggleBtn) return;

  const isVisible = filterSection.style.display === "flex";
  filterSection.style.display = isVisible ? "none" : "flex";
  toggleBtn.innerHTML = isVisible ? "\u2699 Filters" : "\u2699 Hide Filters";
}

function closeModal() {
  const modal = document.getElementById("listingModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

function updateMainImage(src) {
  const mainImage = document.querySelector(".main-image");
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

function openModal(listing) {
  const modal = document.getElementById("listingModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  if (!modal || !modalTitle || !modalBody) return;

  modalTitle.textContent = listing.location?.city || "Property Details";
  let modalContent = "";

  const mainImage = listing.photos?.[0] || "https://via.placeholder.com/800x500?text=Property+Image";
  modalContent += `<img src="${mainImage}" alt="${listing.location?.city}" class="main-image">`;

  if (listing.photos?.length > 1) {
    modalContent += '<div class="modal-gallery">';
    listing.photos.forEach(photo => {
      modalContent += `<img src="${photo}" alt="" onclick="updateMainImage(this.src)">`;
    });
    modalContent += '</div>';
  }

  modalContent += `
    <div class="listing-details">
      <div class="detail-item">
        <div class="detail-value">€${listing.price?.toLocaleString() || 'N/A'}</div>
        <div class="detail-label">Price</div>
      </div>
      <div class="detail-item">
        <div class="detail-value">${listing.bedrooms || '?'}</div>
        <div class="detail-label">Bedrooms</div>
      </div>
      <div class="detail-item">
        <div class="detail-value">${listing.bathrooms || '?'}</div>
        <div class="detail-label">Bathrooms</div>
      </div>
      <div class="detail-item">
        <div class="detail-value">${listing.size || 'N/A'}</div>
        <div class="detail-label">Size</div>
      </div>
    </div>
    <h4>Description</h4>
    <p class="listing-description">${listing.description || 'No description available.'}</p>
    <h4>Location</h4>
    <p class="listing-description">
      ${listing.location?.street || ''}, 
      ${listing.location?.city || ''}, 
      ${listing.location?.state || ''}, 
      ${listing.location?.postalCode || ''}, 
      ${listing.location?.country || ''}
    </p>
    <div class="action-buttons">
      <button class="action-button btn-primary" onclick="contactAgentFor('${listing._id}')">Contact Agent</button>
      <button class="action-button btn-secondary" onclick="scheduleViewing('${listing._id}')">Schedule Viewing</button>
      <button class="action-button btn-secondary" onclick="addToFavorites('${listing._id}')">Add to Favorites</button>
    </div>
  `;

  modalBody.innerHTML = modalContent;
  modal.style.display = "block";
  document.body.style.overflow = "hidden";
}

window.onclick = function (event) {
  const modal = document.getElementById("listingModal");
  if (event.target === modal) closeModal();
};

// ==================== MAIN PAGE INIT ====================
document.addEventListener("DOMContentLoaded", () => {
  const userType = localStorage.getItem("userType");
  const menuToggle = document.getElementById("menuToggle");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const addListingItem = document.getElementById("addListingMenuItem");

  // Show Add Listings only if user is a seller
  if (userType === "seller" && addListingItem) {
    addListingItem.style.display = "block";
  }

  // Toggle dropdown on icon click
  if (menuToggle && dropdownMenu) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent immediate close
      const isVisible = dropdownMenu.style.display === "flex";
      dropdownMenu.style.display = isVisible ? "none" : "flex";
    });

    // Close dropdown if clicked outside
    document.addEventListener("click", (e) => {
      if (!dropdownMenu.contains(e.target) && e.target !== menuToggle) {
        dropdownMenu.style.display = "none";
      }
    });
  }
});


  // Search button behavior
  const searchButton = document.getElementById("searchButton");
  if (searchButton) {
    searchButton.addEventListener("click", () => {
      const filters = {
        country: document.getElementById("filterCountry")?.value.trim(),
        state: document.getElementById("filterState")?.value.trim(),
        city: document.getElementById("filterCity")?.value.trim(),
        postalCode: document.getElementById("postalCode")?.value.trim(),
        minPrice: document.getElementById("minPrice")?.value,
        maxPrice: document.getElementById("maxPrice")?.value,
        bedrooms: document.getElementById("rooms")?.value,
        duration: document.getElementById("filterDuration")?.value,
        apartmentType: document.getElementById("filterApartmentType")?.value,
        listingType: document.querySelector('input[name="listingType"]:checked')?.value === "buy" ? "purchase" : "rent",
        verified: document.getElementById("verified")?.checked
      };
      fetchListings(filters);
    });
  }

fetchListings();


// ==================== FETCH LISTINGS ====================
async function fetchListings(filters = {}) {
  try {
    const resultsContainer = document.getElementById("searchResults");
    if (!resultsContainer) return;

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

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
