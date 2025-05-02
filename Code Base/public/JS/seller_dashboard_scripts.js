document.addEventListener("DOMContentLoaded", async () => {
    const sellerId = localStorage.getItem("userId");
    if (!sellerId) {
      alert("You must be logged in.");
      return;
    }
  
    try {
      const res = await fetch(`/api/listings?sellerId=${sellerId}`);
      const listings = await res.json();
  
      const grid = document.getElementById("listingsGrid");
      grid.innerHTML = "";
  
      if (!listings.length) {
        grid.innerHTML = "<p style='text-align:center;'>You haven't added any listings yet.</p>";
        return;
      }
  
      listings.forEach(listing => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="${listing.photos?.[0] || 'https://via.placeholder.com/400x300'}" />
          <h3>${listing.location?.city || 'Unknown'}, ${listing.location?.country || ''}</h3>
          <div class="price">€${listing.price?.toLocaleString()}</div>
          <div class="details">${listing.bedrooms || '?'} beds • ${listing.bathrooms || '?'} baths</div>
          <div class="actions">
            <button class="edit-btn" onclick="editListing('${listing._id}')">Edit</button>
            <button class="delete-btn" onclick="deleteListing('${listing._id}', this)">Delete</button>
          </div>
        `;
        grid.appendChild(card);
      });
  
    } catch (err) {
      console.error("Error loading listings:", err);
      alert("Failed to fetch listings.");
    }
  });
  
  function editListing(id) {
    window.location.href = `edit_listing.html?id=${id}`;
  }
  
  async function deleteListing(id, button) {
    if (!confirm("Are you sure you want to delete this listing?")) return;
  
    button.disabled = true;
  
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE"
      });
  
      if (res.ok) {
        alert("Listing deleted.");
        button.closest(".card").remove();
      } else {
        alert("Failed to delete listing.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting listing.");
    } finally {
      button.disabled = false;
    }
  }
  