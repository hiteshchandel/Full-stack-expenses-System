const token = localStorage.getItem('token');
if (!token) { alert("⚠️ Login required"); window.location.href = "/"; }

(() => {
    const name = localStorage.getItem('name');
    if (name) {
        document.getElementById("userName").innerText = `${name}`;
    } else {
        document.getElementById("userName").innerText = "Guest";
    }
})();


const leaderboardBtn = document.getElementById("leaderboardBtn");
const leaderboardContainer = document.getElementById("leaderboardContainer");
const leaderboardBody = document.getElementById("leaderboardBody");
const expenseForm = document.getElementById("expenseForm");
const expenseBody = document.getElementById("expenseBody");
const submitBtn = document.getElementById("expenseSubmitBtn");

let editMode = false;
let editId = null;
let expenses = []; // ✅ Global expenses array

// ✅ Fetch Leaderboard
async function fetchLeaderboard() {
    try {
        const res = await fetch("/api/user/premium/showleaderboad", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error("Failed to fetch leaderboard");

        leaderboardBody.innerHTML = "";
        data.data.forEach((user, index) => {
            leaderboardBody.insertAdjacentHTML("beforeend", `
                        <tr>
                          <td>${index + 1}</td>
                          <td>${user.name}</td>
                          <td>₹${parseFloat(user.totalExpense).toFixed(2)}</td>
                        </tr>`);
        });
    } catch (err) {
        console.error(err);
        alert("⚠️ Could not fetch leaderboard.");
    }
}

// ✅ Toggle Leaderboard
leaderboardBtn.addEventListener("click", async () => {
    if (leaderboardContainer.style.display === "none") {
        await fetchLeaderboard();
        leaderboardContainer.style.display = "block";
        leaderboardBtn.innerText = "🙈 Hide Leaderboard";
    } else {
        leaderboardContainer.style.display = "none";
        leaderboardBtn.innerText = "🏆 Show Leaderboard";
    }
});

// ✅ Expense handling
const BASE_URL = "/api/expense";

let currentPage = 1;
let totalPages = 1;

let limit = localStorage.getItem("expensesPerPage")
    ? parseInt(localStorage.getItem("expensesPerPage"))
    : 5;

document.getElementById("pageSize").value = limit;

// Fetch Expenses
async function fetchExpenses(page = 1) {
    try {
        const res = await fetch(`${BASE_URL}/get?page=${page}&limit=${limit}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Failed to load");
        }

        expenseBody.innerHTML = "";
        data.expenses.forEach(exp => {
            expenseBody.insertAdjacentHTML("beforeend", `
                <tr>
                    <td>₹${exp.amount.toFixed(2)}</td>
                    <td>${exp.description}</td>
                    <td>${exp.category}</td>
                    <td>${new Date(exp.createdAt).toLocaleString()}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editExpense(${exp.id},${exp.amount},'${exp.description}','${exp.category}')">Update</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteExpense(${exp.id})">Delete</button>
                    </td>
                </tr>`);
        });

        // ✅ Update pagination state
        currentPage = data.page;
        totalPages = data.totalPages;
        document.getElementById("pageInfo").innerText = `Page ${currentPage} of ${totalPages}`;
        const prevBtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");

        // 🔹 If no expenses or only one page
        if (totalPages <= 1) {
            prevBtn.disabled = true;
            nextBtn.disabled = true;
        } else {
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
        }

    } catch (err) {
        console.error(err);
        alert("⚠️ Could not fetch expenses.");
    }
}


// Pagination button events
document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentPage > 1) fetchExpenses(currentPage - 1);
});

document.getElementById("nextBtn").addEventListener("click", () => {
    if (currentPage < totalPages) fetchExpenses(currentPage + 1);
});

// 🔹 Handle Page Size Change
document.getElementById("pageSize").addEventListener("change", e => {
    limit = parseInt(e.target.value);
    localStorage.setItem("expensesPerPage", limit);  // Save preference
    currentPage = 1; // reset to first page
    fetchExpenses();
});

expenseForm.addEventListener("submit", async e => {
    e.preventDefault();
    const amount = document.getElementById("amount").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;

    try {
        let res;
        if (editMode) {
            res = await fetch(`${BASE_URL}/update/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ amount, description, category })
            });
        } else {
            res = await fetch(`${BASE_URL}/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ amount, description, category })
            });
        }

        if (res.ok) {
            expenseForm.reset();
            fetchExpenses();
            editMode = false;
            editId = null;
            submitBtn.innerText = "Add";
            submitBtn.className = "btn btn-success w-100";
        } else {
            const data = await res.json();
            alert("❌ Operation failed: " + (data.message || "Unknown error"));
        }
    } catch (err) {
        console.error(err);
        alert("⚠️ Something went wrong.");
    }
});

window.editExpense = function (id, amount, description, category) {
    document.getElementById("amount").value = amount;
    document.getElementById("description").value = description;
    document.getElementById("category").value = category;
    editMode = true;
    editId = id;
    submitBtn.innerText = "Update";
    submitBtn.className = "btn btn-primary w-100";
};

window.deleteExpense = async function (id) {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
        const res = await fetch(`${BASE_URL}/delete/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) fetchExpenses();
        else alert("❌ Failed to delete expense.");
    } catch (err) {
        console.error(err);
        alert("⚠️ Error deleting expense.");
    }
};

// ✅ Reports
const downloadBtn = document.getElementById("downloadBtn");
const reportBody = document.getElementById("reportBody");
const filterBtns = document.querySelectorAll(".filter-btn");
let currentFilter = "all";

function renderTable(data) {
    reportBody.innerHTML = "";
    let total = 0;

    if (!data || data.length === 0) {
        reportBody.innerHTML = `<tr><td colspan="5">No records found</td></tr>`;
        document.getElementById("totalAmountDisplay").innerText = "Total Amount: ₹0.00";
        return;
    }
    data.forEach(exp => {
        total += parseFloat(exp.amount);
        reportBody.insertAdjacentHTML("beforeend", `
                <tr>
                    <td>₹${parseFloat(exp.amount).toFixed(2)}</td>
                    <td>${exp.description}</td>
                    <td>${exp.category}</td>
                    <td>${new Date(exp.createdAt).toLocaleString()}</td>
                </tr>`);
    });

    // ✅ Update total below table
    document.getElementById("totalAmountDisplay").innerText =
        `Total Amount: ₹${total.toFixed(2)}`;
}
// ✅ Fetch Report from Backend
async function fetchReport(filterType) {
    try {
        const res = await fetch(`/api/report/generate?filter=${filterType}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to fetch report");
        }
        renderTable(data.data);
    } catch (err) {
        console.error(err);
        alert("⚠️ Could not fetch report.");
    }
}

filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active")); // remove from others
        btn.classList.add("active");
        currentFilter = btn.dataset.type;
        fetchReport(currentFilter);
    });
});

// ✅ Download Report (CSV in frontend)
downloadBtn.addEventListener("click", async () => {
    try {
        const res = await fetch(`/api/report/download?filter=${currentFilter}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        // Convert response to blob for download
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Expense_Report_${currentFilter}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error(error);
        alert("⚠️ Could not download report.")
    }
});

// ✅ Init
document.querySelector('[data-type="all"]').classList.add("active");
fetchExpenses();
fetchReport("all");
