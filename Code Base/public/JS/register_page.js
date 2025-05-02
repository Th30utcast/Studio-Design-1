document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();
  const passwordError = document.getElementById('passwordError');

  if (password !== confirmPassword) {
    passwordError.style.display = "block";
    return;
  } else {
    passwordError.style.display = "none";
  }

  const data = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: password,
    phoneNumber: document.getElementById('phoneNumber').value.trim(),
    address: {
      street: document.getElementById('street').value.trim(),
      city: document.getElementById('city').value.trim(),
      state: document.getElementById('state').value.trim(),
      postalCode: document.getElementById('postalCode').value.trim(),
      country: document.getElementById('country').value.trim()
    },
        userType: document.getElementById('userType').value,
    dataConsent: document.getElementById('dataConsent').checked
  };

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      // Store info in localStorage
      localStorage.setItem("email", data.email);
      localStorage.setItem("userType", data.userType);
      localStorage.setItem("firstName", data.firstName);
      localStorage.setItem("lastName", data.lastName);
      localStorage.setItem("phoneNumber", data.phoneNumber);
      localStorage.setItem("address", JSON.stringify(data.address));
      localStorage.setItem("membership", "silver");
      localStorage.setItem("dataConsent", data.dataConsent);

      alert("Registration successful!");
      window.location.href = "mainlogged_page.html";
    } else {
      const msg = await res.text();
      alert("Registration failed: " + msg);
    }
  } catch (err) {
    console.error(err);
    alert("An error occurred during registration.");
  }
});