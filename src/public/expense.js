
const token = localStorage.getItem('token');
if (!token) { alert("⚠️ Login required"); window.location.href = "/"; }

const premiumBtn = document.getElementById("premiumBtn");
let editMode = false, editId = null;

const BASE_URL = "/api/expense";
const expenseForm = document.getElementById("expenseForm");
const expenseBody = document.getElementById("expenseBody");

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
        if (totalPages <= 0) {
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

// Add/Update Expense
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
            editMode = false; editId = null;
            document.querySelector("#expenseForm button[type='submit']").innerText = "Add";
            document.querySelector("#expenseForm button[type='submit']").classList.replace("btn-primary", "btn-success");
        } else { const data = await res.json(); alert("❌ " + (data.message || "Error")); }
    } catch (err) { console.error(err); alert("⚠️ Something went wrong."); }
});

// Edit/Delete Expense
function editExpense(id, amount, description, category) {
    document.getElementById("amount").value = amount;
    document.getElementById("description").value = description;
    document.getElementById("category").value = category;
    editMode = true; editId = id;
    document.querySelector("#expenseForm button[type='submit']").innerText = "Update";
    document.querySelector("#expenseForm button[type='submit']").classList.replace("btn-success", "btn-primary");
}

async function deleteExpense(id) {
    if (!confirm("Are you sure?")) return;
    try {
        const res = await fetch(`${BASE_URL}/delete/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) fetchExpenses();
        else alert("❌ Failed to delete expense.");
    } catch (err) { console.error(err); alert("⚠️ Error deleting expense."); }
}

fetchExpenses();

// Premium Payment
premiumBtn.addEventListener("click", async () => {
    try {
        const res = await fetch("/api/payments/create", { method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } });
        const data = await res.json();
        if (!res.ok || !data.paymentSessionId) throw new Error(data.error || "Payment init failed");

        const { paymentSessionId, order_id } = data;
        localStorage.setItem("pendingOrderId", order_id);
        const cashfree = new Cashfree(paymentSessionId);
        await cashfree.redirect();
    } catch (err) { console.error(err); alert("⚠️ Payment failed"); }
});

// Check payment status
window.addEventListener("load", () => {
    const order_id = localStorage.getItem("pendingOrderId");
    if (!order_id) return;
    const checkStatus = async () => {
        try {
            const res = await fetch(`/api/payments/status/${order_id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const statusData = await res.json();
            
            if (statusData.status === "SUCCESS") {
                alert("🎉 Payment successful!");
                localStorage.removeItem("pendingOrderId");
                window.location.href = '/premium'; // Redirect to premium page
            } else if (statusData.status === "FAILED") {
                alert("❌ Payment failed. Try again.");
                localStorage.removeItem("pendingOrderId");
                window.location.href = '/expenses';
            } else {
                console.log("Payment pending, checking again...");
                setTimeout(checkStatus, 5000);
            }
        } catch (err) {
            console.error("Error checking payment status:", err);
            setTimeout(checkStatus, 5000);
        }
    }
    checkStatus();
});
