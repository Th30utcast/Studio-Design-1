// ==================== DROPDOWN MENU ====================
const menuToggle = document.getElementById("menuToggle");
const dropdownMenu = document.getElementById("dropdownMenu");

menuToggle.addEventListener("click", () => {
  dropdownMenu.style.display = dropdownMenu.style.display === "flex" ? "none" : "flex";
});

document.addEventListener("click", (e) => {
  if (!dropdownMenu.contains(e.target) && e.target !== menuToggle) {
    dropdownMenu.style.display = "none";
  }
});

// ==================== FILTER TOGGLE ====================
function toggleFilters() {
  const section = document.getElementById("filterOptions");
  const btn = document.getElementById("filterToggleBtn");
  const visible = section.style.display === "flex";
  section.style.display = visible ? "none" : "flex";
  btn.innerHTML = visible ? "&#9881; Filters" : "&#9881; Hide Filters";
}

// ==================== DURATION FIELD HANDLING ====================
function toggleDuration() {
  const rentRadio = document.querySelector('input[name="listingType"][value="rent"]');
  const durationField = document.getElementById("duration");
  if (rentRadio && rentRadio.checked) {
    durationField.style.display = "block";
  } else {
    durationField.style.display = "none";
    durationField.value = "";
  }
}

// ==================== FETCH LISTINGS ====================
async function fetchListings(filters = {}) {
  const resultsContainer = document.getElementById("searchResults");
  const params = new URLSearchParams();

  // Convert structured filters
  if (filters.country) params.append("country", filters.country);
  if (filters.state) params.append("state", filters.state);
  if (filters.city) params.append("city", filters.city);
  if (filters.postalCode) params.append("postalCode", filters.postalCode);
  if (filters.minPrice) params.append("minPrice", filters.minPrice);
  if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
  if (filters.bedrooms) params.append("bedrooms", filters.bedrooms);
  if (filters.apartmentType) params.append("apartmentType", filters.apartmentType);
  if (filters.duration) params.append("duration", filters.duration);
  if (filters.listingType) params.append("listingType", filters.listingType);
  if (filters.verified) params.append("verified", "true");

  try {
    const res = await fetch(`/api/listings?${params.toString()}`);
    const listings = await res.json();

    resultsContainer.innerHTML = '';
    if (!listings.length) {
      resultsContainer.innerHTML = "<p>No properties found.</p>";
      return;
    }

    listings.forEach(listing => {
      const card = document.createElement("div");
      card.className = "property-card";
      card.innerHTML = `
        <img src="${listing.photos?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}" class="property-image" />
        <div class="property-info">
          <h3>${listing.location?.city || "Unknown City"}, ${listing.location?.country || ""}</h3>
          <div class="property-price">€${listing.price?.toLocaleString() || "N/A"}</div>
          <div class="property-details">${listing.bedrooms || "?"} beds | ${listing.bathrooms || "?"} baths</div>
          <p>${listing.description?.substring(0, 100) || "No description"}${listing.description?.length > 100 ? "..." : ""}</p>
        </div>
      `;
      resultsContainer.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading listings:", error);
    resultsContainer.innerHTML = "<p style='color:red;'>Failed to load listings.</p>";
  }
}

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", () => {
  fetchListings();

  document.getElementById("searchButton").addEventListener("click", () => {
    const filters = {
      country: document.getElementById("country")?.value.trim(),
      state: document.getElementById("state")?.value.trim(),
      city: document.getElementById("city")?.value.trim(),
      postalCode: document.getElementById("postalCode")?.value.trim(),
      minPrice: document.getElementById("minPrice")?.value,
      maxPrice: document.getElementById("maxPrice")?.value,
      bedrooms: document.getElementById("rooms")?.value,
      apartmentType: document.getElementById("apartmentType")?.value,
      duration: document.getElementById("duration")?.value,
      listingType: document.querySelector('input[name="listingType"]:checked')?.value === "buy" ? "purchase" : "rent",
      verified: document.getElementById("verified")?.checked
    };

    fetchListings(filters);
  });
});
