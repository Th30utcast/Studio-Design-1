document.addEventListener("DOMContentLoaded", () => {
    const email = localStorage.getItem("email");
    const membership = localStorage.getItem("membership");
    const targetPlan = membership === "gold" ? "silver" : "gold";
  
    const planSummary = document.getElementById("planSummary");
    if (planSummary) {
      planSummary.textContent = `You are switching from ${membership || "standard"} to ${targetPlan}.`;
    }
  
    document.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
  
      // Fetch and clean input values
      const cardNumber = document.getElementById("cardNumber").value.replace(/\s/g, '');
      const expiry = document.getElementById("expiry").value.trim();
      const cvv = document.getElementById("cvv").value.trim();
  
      // Validate Card Number
      if (!/^\d{16}$/.test(cardNumber)) {
        alert("❌ Card number must be 16 digits.");
        return;
      }
  
      // Validate Expiry Date
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
        alert("❌ Expiry must be in MM/YY format.");
        return;
      } else {
        const [mm, yy] = expiry.split('/');
        const expDate = new Date(`20${yy}`, Number(mm));
        const now = new Date();
        if (expDate < now) {
          alert("❌ Card is expired.");
          return;
        }
      }
  
      // Validate CVV
      if (!/^\d{3}$/.test(cvv)) {
        alert("❌ CVV must be 3 digits.");
        return;
      }
  
      // Show loading
      document.getElementById("loadingOverlay").style.display = "flex";
  
      setTimeout(async () => {
        try {
          const res = await fetch("/api/auth/upgrade-membership", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, newPlan: targetPlan })
          });
  
          document.getElementById("loadingOverlay").style.display = "none";
  
          if (res.ok) {
            alert(`✅ Your membership has been changed to ${targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)}.`);
            localStorage.setItem("membership", targetPlan);
            window.location.href = "account_page.html";
          } else {
            const msg = await res.text();
            alert("❌ Error: " + msg);
          }
        } catch (err) {
          console.error("Upgrade error:", err);
          alert("❌ Something went wrong.");
          document.getElementById("loadingOverlay").style.display = "none";
        }
      }, 2000);
    });
  });
  