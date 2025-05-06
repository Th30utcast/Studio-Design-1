document.getElementById('listingForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const sellerId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  formData.append("sellerId", sellerId);

  const location = {
    street: form.street.value,
    city: form.city.value,
    state: form.state.value,
    postalCode: form.postalCode.value,
    country: form.country.value
  };
  formData.append("location", JSON.stringify(location));

  try {
    const res = await fetch('/api/listings/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
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
