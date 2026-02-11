const submitBtn = document.getElementById("submitBtn");
const tableBody = document.getElementById("dataTableBody");
const pageSizeSelect = document.getElementById("pageSizeSelect");
const paginationInfo = document.getElementById("paginationInfo");
const paginationControls = document.getElementById("paginationControls");

let dataStore = [];
let nextId = 1;
let editingId = null;
let currentPage = 1;
let pageSize = 5;

const STORAGE_KEY = "tableDataStore";

function saveToLocalStorage() {
    try {
        const dataToSave = {
            records: dataStore,
            nextId: nextId,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        console.log(
            "✅ Data saved to localStorage:",
            dataStore.length,
            "records",
        );
    } catch (error) {
        console.error("❌ Error saving to localStorage:", error);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            dataStore = data.records || [];
            nextId = data.nextId || 1;
            console.log(
                "✅ Data loaded from localStorage:",
                dataStore.length,
                "records",
            );
            return true;
        }
    } catch (error) {
        console.error("❌ Error loading from localStorage:", error);
    }
    return false;
}

function clearLocalStorage() {
    localStorage.removeItem(STORAGE_KEY);
    console.log("localStorage cleared");
}

function getFormData() {
    const dateFrom = document.getElementById("dateFrom").value;
    const dateTo = document.getElementById("dateTo").value;
    const dateRange =
        dateFrom && dateTo
            ? `${dateFrom} ~ ${dateTo}`
            : dateFrom || dateTo || "-";

    return {
        date: dateRange,
        locationCode:
            document.getElementById("locationCodeSelect").value || "-",
        locationName: document.getElementById("locationName").value || "-",
        labelCode: document.getElementById("labelCodeSelect").value || "-",
        labelName: document.getElementById("labelName").value || "-",
        productCode:
            document.getElementById("productCodeSelect").value || "-",
        productName: document.getElementById("productName").value || "-",
        lotCode: document.getElementById("lotCodeSelect").value || "-",
        lotNumber: document.getElementById("lotNumber").value || "-",
        orderCode: document.getElementById("orderCodeSelect").value || "-",
        orderNumber: document.getElementById("orderNumber").value || "-",
        materialCode:
            document.getElementById("materialCodeSelect").value || "-",
        materialName: document.getElementById("materialName").value || "-",
        warehouseCode:
            document.getElementById("warehouseCodeSelect").value || "-",
        warehouseName: document.getElementById("warehouseName").value || "-",
        weight: document.getElementById("weight").value || "-",
        specValue: document.getElementById("specValue").value || "-",
        stockLocation: document.getElementById("stockLocation").value || "-",
        notes: document.getElementById("notes").value || "-",
        personCode: document.getElementById("personCodeSelect").value || "-",
        personName: document.getElementById("personName").value || "-",
    };
}

function populateForm(data) {
    if (data.date && data.date.includes("~")) {
        const dates = data.date.split("~").map((d) => d.trim());
        document.getElementById("dateFrom").value = dates[0] || "";
        document.getElementById("dateTo").value = dates[1] || "";
    }

    document.getElementById("locationName").value =
        data.locationName !== "-" ? data.locationName : "";
    document.getElementById("labelName").value =
        data.labelName !== "-" ? data.labelName : "";
    document.getElementById("productName").value =
        data.productName !== "-" ? data.productName : "";
    document.getElementById("lotNumber").value =
        data.lotNumber !== "-" ? data.lotNumber : "";
    document.getElementById("orderNumber").value =
        data.orderNumber !== "-" ? data.orderNumber : "";
    document.getElementById("materialName").value =
        data.materialName !== "-" ? data.materialName : "";
    document.getElementById("warehouseName").value =
        data.warehouseName !== "-" ? data.warehouseName : "";
    document.getElementById("weight").value =
        data.weight !== "-" ? data.weight : "";
    document.getElementById("specValue").value =
        data.specValue !== "-" ? data.specValue : "";
    document.getElementById("stockLocation").value =
        data.stockLocation !== "-" ? data.stockLocation : "";
    document.getElementById("notes").value =
        data.notes !== "-" ? data.notes : "";
    document.getElementById("personName").value =
        data.personName !== "-" ? data.personName : "";
}

function createRecord(formData) {
    const record = {
        id: nextId++,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    dataStore.unshift(record);
    saveToLocalStorage();
    console.log("Record created:", record.id);
    return record;
}

function updateRecord(id, formData) {
    const index = dataStore.findIndex((r) => r.id === id);
    if (index !== -1) {
        dataStore[index] = {
            ...dataStore[index],
            ...formData,
            updatedAt: new Date().toISOString(),
        };
        saveToLocalStorage();
        console.log("Record updated:", id);
        return dataStore[index];
    }
    return null;
}

function deleteRecord(id) {
    const index = dataStore.findIndex((r) => r.id === id);
    if (index !== -1) {
        const deleted = dataStore.splice(index, 1)[0];
        saveToLocalStorage();
        console.log("Record deleted:", id);
        return deleted;
    }
    return null;
}

function getRecordById(id) {
    return dataStore.find((r) => r.id === id);
}

function formatCombinedDisplay(code, name) {
    if (code !== "-" && name !== "-") {
        return `${code} - ${name}`;
    }
    return name !== "-" ? name : code;
}

function parseCombinedDisplay(text) {
    if (text.includes(" - ")) {
        const parts = text.split(" - ");
        return { code: parts[0], name: parts.slice(1).join(" - ") };
    }
    return { code: text, name: text };
}

function renderTable() {
    tableBody.innerHTML = "";

    const totalRecords = dataStore.length;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalRecords);

    const pageRecords = dataStore.slice(startIndex, endIndex);

    pageRecords.forEach((record, index) => {
        const actualRowNumber = startIndex + index + 1;
        const row = createRowElement(record, actualRowNumber);
        tableBody.appendChild(row);
    });

    updatePaginationInfo(startIndex + 1, endIndex, totalRecords);
    renderPaginationControls();

    console.log("Table rendered:", dataStore.length, "records");
}

function updatePaginationInfo(start, end, total) {
    if (total === 0) {
        paginationInfo.textContent = "Showing 0 records";
    } else {
        paginationInfo.textContent = `Showing ${start} to ${end} of ${total} records`;
    }
}

function renderPaginationControls() {
    const totalRecords = dataStore.length;
    const totalPages = Math.ceil(totalRecords / pageSize);

    paginationControls.innerHTML = "";

    if (totalPages <= 1) {
        return;
    }

    const prevLi = document.createElement("li");
    prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
    prevLi.innerHTML = `<a class="page-link" href="#" data-page="prev">Previous</a>`;
    paginationControls.appendChild(prevLi);
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
        const firstLi = document.createElement("li");
        firstLi.className = "page-item";
        firstLi.innerHTML = `<a class="page-link" href="#" data-page="1">1</a>`;
        paginationControls.appendChild(firstLi);

        if (startPage > 2) {
            const dotsLi = document.createElement("li");
            dotsLi.className = "page-item disabled";
            dotsLi.innerHTML = `<span class="page-link">...</span>`;
            paginationControls.appendChild(dotsLi);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement("li");
        pageLi.className = `page-item ${i === currentPage ? "active" : ""}`;
        pageLi.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
        paginationControls.appendChild(pageLi);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dotsLi = document.createElement("li");
            dotsLi.className = "page-item disabled";
            dotsLi.innerHTML = `<span class="page-link">...</span>`;
            paginationControls.appendChild(dotsLi);
        }

        const lastLi = document.createElement("li");
        lastLi.className = "page-item";
        lastLi.innerHTML = `<a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>`;
        paginationControls.appendChild(lastLi);
    }

    const nextLi = document.createElement("li");
    nextLi.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
    nextLi.innerHTML = `<a class="page-link" href="#" data-page="next">Next</a>`;
    paginationControls.appendChild(nextLi);

    paginationControls.querySelectorAll("a.page-link").forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const page = this.getAttribute("data-page");

            if (page === "prev" && currentPage > 1) {
                currentPage--;
                renderTable();
            } else if (page === "next" && currentPage < totalPages) {
                currentPage++;
                renderTable();
            } else if (page !== "prev" && page !== "next") {
                currentPage = parseInt(page);
                renderTable();
            }
        });
    });
}

function createRowElement(record, rowNumber) {
    const newRow = document.createElement("tr");
    newRow.setAttribute("data-id", record.id);

    const locationDisplay = formatCombinedDisplay(
        record.locationCode,
        record.locationName,
    );
    const labelDisplay = formatCombinedDisplay(
        record.labelCode,
        record.labelName,
    );
    const productDisplay = formatCombinedDisplay(
        record.productCode,
        record.productName,
    );
    const lotDisplay = formatCombinedDisplay(
        record.lotCode,
        record.lotNumber,
    );
    const orderDisplay = formatCombinedDisplay(
        record.orderCode,
        record.orderNumber,
    );
    const materialDisplay = formatCombinedDisplay(
        record.materialCode,
        record.materialName,
    );
    const warehouseDisplay = formatCombinedDisplay(
        record.warehouseCode,
        record.warehouseName,
    );
    const personDisplay = formatCombinedDisplay(
        record.personCode,
        record.personName,
    );

    newRow.innerHTML = `
          <td>${rowNumber}</td>
          <td>${record.date}</td>
          <td>${locationDisplay}</td>
          <td>${labelDisplay}</td>
          <td>${productDisplay}</td>
          <td>${lotDisplay}</td>
          <td>${orderDisplay}</td>
          <td>${materialDisplay}</td>
          <td>${warehouseDisplay}</td>
          <td>${record.weight}</td>
          <td>${record.specValue}</td>
          <td>${record.stockLocation}</td>
          <td>${record.notes}</td>
          <td>${personDisplay}</td>
          <td>
            <button class="btn btn-sm btn-warning btn-edit me-1" data-id="${record.id}">Edit</button>
            <button class="btn btn-sm btn-danger btn-delete" data-id="${record.id}">Delete</button>
          </td>
        `;

    attachRowEventListeners(newRow, record.id);
    return newRow;
}

function clearForm() {
    document.getElementById("dateFrom").value = "";
    document.getElementById("dateTo").value = "";
    document.getElementById("locationCodeSelect").selectedIndex = 0;
    document.getElementById("locationName").value = "";
    document.getElementById("labelCodeSelect").selectedIndex = 0;
    document.getElementById("labelName").value = "";
    document.getElementById("productCodeSelect").selectedIndex = 0;
    document.getElementById("productName").value = "";
    document.getElementById("lotCodeSelect").selectedIndex = 0;
    document.getElementById("lotNumber").value = "";
    document.getElementById("orderCodeSelect").selectedIndex = 0;
    document.getElementById("orderNumber").value = "";
    document.getElementById("materialCodeSelect").selectedIndex = 0;
    document.getElementById("materialName").value = "";
    document.getElementById("warehouseCodeSelect").selectedIndex = 0;
    document.getElementById("warehouseName").value = "";
    document.getElementById("weight").value = "";
    document.getElementById("specValue").value = "";
    document.getElementById("stockLocation").value = "";
    document.getElementById("notes").value = "";
    document.getElementById("personCodeSelect").selectedIndex = 0;
    document.getElementById("personName").value = "";
}

function attachRowEventListeners(row, recordId) {
    const editBtn = row.querySelector(".btn-edit");
    const deleteBtn = row.querySelector(".btn-delete");

    editBtn.addEventListener("click", function () {
        const record = getRecordById(recordId);
        if (record) {
            populateForm(record);
            editingId = recordId; // Lưu ID thay vì DOM reference
            submitBtn.textContent = "Cập nhật";
            submitBtn.classList.remove("btn-primary");
            submitBtn.classList.add("btn-success");
            window.scrollTo({ top: 0, behavior: "smooth" });
            console.log("✏️ Editing record:", recordId);
        }
    });

    deleteBtn.addEventListener("click", function () {
        if (confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) {
            deleteRecord(recordId);
            renderTable();
        }
    });
}

submitBtn.addEventListener("click", function () {
    const formData = getFormData();

    if (editingId) {
        updateRecord(editingId, formData);
        editingId = null;
        submitBtn.textContent = "Lưu";
        submitBtn.classList.remove("btn-success");
        submitBtn.classList.add("btn-primary");
    } else {
        createRecord(formData);
    }

    renderTable();
    clearForm();
});

document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 Application starting...");

    const loaded = loadFromLocalStorage();

    if (loaded && dataStore.length > 0) {
        renderTable();
    } else {
        console.log("📝 No saved data found. Starting fresh.");
        updatePaginationInfo(0, 0, 0);
    }

    console.log("✅ Application ready!");
    console.log("💾 Data store:", dataStore.length, "records");
    console.log("🔑 Next ID:", nextId);
});

pageSizeSelect.addEventListener("change", function () {
    pageSize = parseInt(this.value);
    currentPage = 1;
    renderTable();
    console.log("Page size changed to:", pageSize);
});

window.debugDataStore = {
    view: () => {
        console.table(dataStore);
        return dataStore;
    },
    clear: () => {
        if (confirm("⚠️ Clear all data?")) {
            dataStore = [];
            nextId = 1;
            clearLocalStorage();
            renderTable();
            console.log("🗑️ All data cleared");
        }
    },
    export: () => {
        const json = JSON.stringify(dataStore, null, 2);
        console.log(json);
        return json;
    },
    import: (data) => {
        try {
            dataStore = JSON.parse(data);
            saveToLocalStorage();
            renderTable();
            console.log("✅ Data imported");
        } catch (e) {
            console.error("❌ Import failed:", e);
        }
    },
};

console.log("🛠️ Debug tools available: window.debugDataStore");
console.log("  - debugDataStore.view() - View all records");
console.log("  - debugDataStore.clear() - Clear all data");
console.log("  - debugDataStore.export() - Export as JSON");
console.log("  - debugDataStore.import(json) - Import from JSON");