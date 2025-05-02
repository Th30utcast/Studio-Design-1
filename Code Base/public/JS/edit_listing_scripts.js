document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const listingId = urlParams.get("id");
    if (!listingId) {
      alert("No listing ID provided.");
      return;
    }
  
    const listingIdField = document.getElementById("listingId");
    const priceField = document.getElementById("price");
    const durationField = document.getElementById("duration");
    const sizeField = document.getElementById("size");
    const bedroomsField = document.getElementById("bedrooms");
    const bathroomsField = document.getElementById("bathrooms");
    const descriptionField = document.getElementById("description");
  
    try {
      const res = await fetch(`/api/listings/${listingId}`);
      if (!res.ok) throw new Error("Failed to load listing.");
      const data = await res.json();
  
      listingIdField.value = data._id;
      priceField.value = data.price || "";
      durationField.value = data.duration || "";
      sizeField.value = data.size || "";
      bedroomsField.value = data.bedrooms || "";
      bathroomsField.value = data.bathrooms || "";
      descriptionField.value = data.description || "";
  
    } catch (err) {
      console.error(err);
      alert("Error loading listing data.");
    }
  
    document.getElementById("editForm").addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const updatedData = {
        price: priceField.value,
        duration: durationField.value,
        size: sizeField.value,
        bedrooms: bedroomsField.value,
        bathrooms: bathroomsField.value,
        description: descriptionField.value
      };
  
      try {
        const res = await fetch(`/api/listings/${listingIdField.value}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData)
        });
  
        if (res.ok) {
          alert("Listing updated successfully.");
          window.location.href = "seller_dashboard.html";
        } else {
          const errorText = await res.text();
          alert("Failed to update listing: " + errorText);
        }
      } catch (err) {
        console.error(err);
        alert("Server error during update.");
      }
    });
  });
  