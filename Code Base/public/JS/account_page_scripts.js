document.addEventListener("DOMContentLoaded", async () => {
  const email = localStorage.getItem("email");
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");

  document.getElementById("email").value = email || "";
  document.getElementById("firstName").value = firstName || "";
  document.getElementById("lastName").value = lastName || "";

  const statusText = document.getElementById("verification-status");
  const verificationForm = document.getElementById("verificationForm");

  if (!email) {
    statusText.textContent = "⚠️ No email found. Please log in.";
    return;
  }

  try {
    const res = await fetch(`/api/auth/account?email=${email}`);
    const data = await res.json();

    if (res.ok) {
      if (data.isVerified) {
        statusText.textContent = "✅ Your account is verified.";
      } else {
        statusText.textContent = "❌ Your account is not verified.";
        verificationForm.style.display = "block";
      }


      if (data.membership) {
        const membershipInput = document.getElementById("membership");
        const subscriptionBox = document.getElementById("subscriptionInfo");
        const actionsBox = document.getElementById("membershipActions");
        const changePlanBtn = document.getElementById("changePlanBtn");

        if (membershipInput) membershipInput.value = data.membership;

        if (localStorage.getItem("userType") === "seller") {
          subscriptionBox.style.display = "block";
          actionsBox.style.display = "block";

          if (changePlanBtn) {
            const current = data.membership.toLowerCase();
            const target = current === "gold" ? "silver" : "gold";
            changePlanBtn.textContent = current === "gold" ? "Downgrade to Silver" : "Upgrade to Gold";

            changePlanBtn.addEventListener("click", async () => {
              if (target === "silver") {
                const confirmed = confirm("Are you sure you want to downgrade to Silver? You will lose unlimited listing access.");
                if (!confirmed) return;

                try {
                  const downgrade = await fetch("/api/auth/upgrade-membership", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, newPlan: "silver" })
                  });

                  if (downgrade.ok) {
                    alert("✅ Downgraded to Silver.");
                    localStorage.setItem("membership", "silver");
                    window.location.reload();
                  } else {
                    const msg = await downgrade.text();
                    alert("❌ Failed to downgrade.\n" + msg);
                  }
                } catch (err) {
                  console.error("Downgrade error:", err);
                  alert("❌ Error while downgrading.");
                }

              } else {
                window.location.href = "payment_page.html";
              }
            });
          }
        }
      }


      if (data.photo) {
        document.getElementById("profilePreview").src = data.photo;
        localStorage.setItem("photo", data.photo);
      }

      document.getElementById("phoneNumber").value = data.phoneNumber || "";
      localStorage.setItem("phoneNumber", data.phoneNumber || "");

      if (data.address) {
        document.getElementById("street").value = data.address.street || "";
        document.getElementById("city").value = data.address.city || "";
        document.getElementById("state").value = data.address.state || "";
        document.getElementById("postalCode").value = data.address.postalCode || "";
        document.getElementById("country").value = data.address.country || "";
      }
      
      document.getElementById("dataConsent").checked = data.dataConsent === true;
      localStorage.setItem("dataConsent", data.dataConsent);

    } else {
      statusText.textContent = "⚠️ Could not check verification status.";
    }
  } catch (err) {
    console.error(err);
    statusText.textContent = "❌ Server error.";
  }


document.getElementById("updateInfoBtn").addEventListener("click", async () => {
  const phoneNumber = document.getElementById("phoneNumber").value;
  const address = {
    street: document.getElementById("street").value,
    city: document.getElementById("city").value,
    state: document.getElementById("state").value,
    postalCode: document.getElementById("postalCode").value,
    country: document.getElementById("country").value
  };
  const profilePicture = document.getElementById("profilePicture").files[0];
  const dataConsent = document.getElementById("dataConsent").checked;

  const formData = new FormData();
  formData.append("email", email);
  formData.append("phoneNumber", phoneNumber);
  formData.append("address", JSON.stringify(address));
  formData.append("dataConsent", dataConsent);
  if (profilePicture) {
    formData.append("profilePicture", profilePicture);
  }

  try {
    const res = await fetch("/api/auth/update-info", {
      method: "POST",
      body: formData
    });

    if (res.ok) {
      alert("Your information has been updated.");

      const refreshed = await fetch(`/api/auth/account?email=${email}`);
      const updated = await refreshed.json();

      document.getElementById("phoneNumber").value = updated.phoneNumber || "";

      if (updated.address) {
        document.getElementById("street").value = updated.address.street || "";
        document.getElementById("city").value = updated.address.city || "";
        document.getElementById("state").value = updated.address.state || "";
        document.getElementById("postalCode").value = updated.address.postalCode || "";
        document.getElementById("country").value = updated.address.country || "";

        localStorage.setItem("address", JSON.stringify(updated.address));
      }

      document.getElementById("dataConsent").checked = updated.dataConsent === true;
      localStorage.setItem("dataConsent", updated.dataConsent);

      if (updated.photo) {
        document.getElementById("profilePreview").src = updated.photo;
        localStorage.setItem("photo", updated.photo);
      }

    } else {
      const msg = await res.text();
      alert("❌ Failed to update information.\n" + msg);
    }

  } catch (err) {
    console.error(err);
    alert("❌ Something went wrong while sending the update.");
  }
});


  document.getElementById("removePhotoBtn").addEventListener("click", async () => {
    if (!email) return alert("You must be logged in.");

    try {
      const res = await fetch("/api/auth/remove-photo", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        document.getElementById("profilePreview").src = "/uploads/default-profile.png";
        localStorage.setItem("photo", "/uploads/default-profile.png");
        alert("Profile photo has been removed.");
      } else {
        const msg = await res.text();
        alert("Failed to remove photo: " + msg);
      }
    } catch (err) {
      console.error(err);
      alert("Error removing profile photo.");
    }
  });


  document.getElementById("verificationForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", email);
    formData.append("idDocument", document.getElementById("idUpload").files[0]);

    try {
      const res = await fetch("/api/auth/upload-id", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        alert("✅ Document uploaded. You're now verified!");
        document.getElementById("verification-status").textContent = "✅ Your account is verified.";
        document.getElementById("verificationForm").style.display = "none";
      } else {
        const msg = await res.text();
        alert("❌ Error: " + msg);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed.");
    }
  });
});