document.getElementById('listingForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
  
    const sellerId = localStorage.getItem("userId");
    if (!sellerId) {
      alert("User not logged in. Please log in first.");
      return;
    }
  
    formData.append("sellerId", sellerId);
  
    try {
      const res = await fetch('/api/listings/add', {
        method: 'POST',
        body: formData
      });
  
      const result = await res.json();
  
      if (res.ok) {
        alert("Listing added successfully!");
        form.reset();
        window.location.href = "mainlogged_page.html";
      } else {
        alert(result.error || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  });