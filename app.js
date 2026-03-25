/* ============================
   SHOP MANAGEMENT SYSTEM — JS
   Full CRUD + State Management
   ============================= */

'use strict';

// ===== STATE =====
const state = {
  products: [
    { id: 'SKU001', name: 'Basmati Rice 5kg', category: 'Grocery', price: 420, stock: 8, threshold: 10 },
    { id: 'SKU002', name: 'Sunflower Oil 1L', category: 'Grocery', price: 155, stock: 35, threshold: 10 },
    { id: 'SKU003', name: 'Sugar 1kg', category: 'Grocery', price: 48, stock: 4, threshold: 15 },
    { id: 'SKU004', name: 'Toor Dal 1kg', category: 'Grocery', price: 130, stock: 22, threshold: 10 },
    { id: 'SKU005', name: 'Notebook A4', category: 'Stationery', price: 65, stock: 3, threshold: 5 },
    { id: 'SKU006', name: 'Ballpoint Pen Box', category: 'Stationery', price: 120, stock: 18, threshold: 5 },
    { id: 'SKU007', name: 'Hand Sanitizer 500ml', category: 'Health', price: 180, stock: 12, threshold: 8 },
    { id: 'SKU008', name: 'Washing Powder 2kg', category: 'Home Care', price: 220, stock: 6, threshold: 10 },
  ],
  sales: [
    { id: 'SAL001', date: '2026-03-25', customer: 'Ravi Kumar', product: 'Basmati Rice 5kg', qty: 2, total: 840, status: 'Completed' },
    { id: 'SAL002', date: '2026-03-25', customer: 'Priya Sharma', product: 'Sunflower Oil 1L', qty: 3, total: 465, status: 'Completed' },
    { id: 'SAL003', date: '2026-03-24', customer: 'Anand Rao', product: 'Sugar 1kg', qty: 5, total: 240, status: 'Completed' },
    { id: 'SAL004', date: '2026-03-24', customer: 'Meena Reddy', product: 'Notebook A4', qty: 10, total: 650, status: 'Pending' },
    { id: 'SAL005', date: '2026-03-23', customer: 'Suresh Gupta', product: 'Toor Dal 1kg', qty: 4, total: 520, status: 'Completed' },
  ],
  customers: [
    { id: 'C001', name: 'Ravi Kumar', email: 'ravi@email.com', phone: '9876543210', spent: 3200 },
    { id: 'C002', name: 'Priya Sharma', email: 'priya@email.com', phone: '9123456780', spent: 5600 },
    { id: 'C003', name: 'Anand Rao', email: 'anand@email.com', phone: '9988776655', spent: 1850 },
    { id: 'C004', name: 'Meena Reddy', email: 'meena@email.com', phone: '9876001234', spent: 4200 },
    { id: 'C005', name: 'Suresh Gupta', email: 'suresh@email.com', phone: '9000112233', spent: 2900 },
  ],
  suppliers: [
    { id: 'SUP001', name: 'Sri Lakshmi Traders', contact: '9988001122', category: 'Grocery', items: 12 },
    { id: 'SUP002', name: 'Metro Stationery Co.', contact: '9123000988', category: 'Stationery', items: 8 },
    { id: 'SUP003', name: 'Wellness Hub', contact: '9876123400', category: 'Health', items: 5 },
    { id: 'SUP004', name: 'CleanPro Supplies', contact: '9000987001', category: 'Home Care', items: 6 },
  ],
  modalMode: null,  // 'add' | 'edit'
  modalType: null,  // 'product' | 'sale' | 'customer' | 'supplier'
  editId: null,
};

// ===== DOM HELPERS =====
const $ = id => document.getElementById(id);
const fmt = n => '₹' + Number(n).toLocaleString('en-IN');

function showToast(msg) {
  const toast = $('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

function genId(prefix, arr) {
  const nums = arr.map(x => parseInt(x.id.replace(prefix, '')) || 0);
  const next = (Math.max(0, ...nums) + 1).toString().padStart(3, '0');
  return prefix + next;
}

// ===== NAVIGATION =====
const sections = ['dashboard', 'inventory', 'sales', 'customers', 'suppliers', 'reports'];
const titles = {
  dashboard: 'Dashboard', inventory: 'Inventory',
  sales: 'Sales', customers: 'Customers',
  suppliers: 'Suppliers', reports: 'Reports'
};

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const sec = btn.dataset.section;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    sections.forEach(s => $('section-' + s).classList.remove('active'));
    $('section-' + sec).classList.add('active');
    $('page-title').textContent = titles[sec];
    if (sec === 'reports') renderReports();
  });
});

// ===== DATE =====
function setDate() {
  const d = new Date();
  $('page-date').textContent = d.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}
setDate();

// ===== DASHBOARD =====
function renderDashboard() {
  const todaySales = state.sales.filter(s => s.date === '2026-03-25');
  const revenue = todaySales.reduce((a, s) => a + s.total, 0);
  const lowStock = state.products.filter(p => p.stock <= p.threshold);

  $('kpi-revenue').textContent = fmt(revenue);
  $('kpi-orders').textContent = todaySales.length;
  $('kpi-low-stock').textContent = lowStock.length;
  $('kpi-customers').textContent = state.customers.length;

  // Recent sales table
  const tbody = $('recent-sales-body');
  tbody.innerHTML = state.sales.slice(0, 5).map(s => `
    <tr>
      <td><span style="color:var(--accent)">${s.id}</span></td>
      <td>${s.customer}</td>
      <td>${s.product}</td>
      <td style="color:var(--text-primary);font-weight:700">${fmt(s.total)}</td>
      <td>${badgeHtml(s.status)}</td>
    </tr>
  `).join('');

  // Low stock alerts
  const list = $('low-stock-list');
  if (lowStock.length === 0) {
    list.innerHTML = '<div class="alert-item"><span class="alert-name">All items sufficiently stocked ✓</span></div>';
  } else {
    list.innerHTML = lowStock.map(p => `
      <div class="alert-item">
        <span class="alert-name">${p.name}</span>
        <span class="alert-stock">${p.stock} left</span>
      </div>
    `).join('');
  }
}

function badgeHtml(status) {
  const map = {
    'Completed': 'badge-success',
    'Pending': 'badge-warning',
    'Cancelled': 'badge-danger',
    'Active': 'badge-success',
    'Low Stock': 'badge-danger',
    'In Stock': 'badge-success',
  };
  return `<span class="badge ${map[status] || 'badge-info'}">${status}</span>`;
}

// ===== INVENTORY =====
function renderInventory(filter = '') {
  const items = state.products.filter(p =>
    p.name.toLowerCase().includes(filter) ||
    p.category.toLowerCase().includes(filter) ||
    p.id.toLowerCase().includes(filter)
  );
  $('inventory-body').innerHTML = items.map(p => {
    const status = p.stock === 0 ? 'Out of Stock' : p.stock <= p.threshold ? 'Low Stock' : 'In Stock';
    return `
      <tr>
        <td><span style="color:var(--accent);font-size:0.7rem">${p.id}</span></td>
        <td style="color:var(--text-primary)">${p.name}</td>
        <td>${p.category}</td>
        <td style="color:var(--text-primary)">${fmt(p.price)}</td>
        <td style="color:${p.stock <= p.threshold ? 'var(--negative)' : 'var(--text-secondary)'};font-weight:${p.stock <= p.threshold ? '700' : '400'}">${p.stock}</td>
        <td>${badgeHtml(status)}</td>
        <td>
          <div class="action-btns">
            <button class="btn btn-edit" onclick="openEditProduct('${p.id}')">Edit</button>
            <button class="btn btn-danger" onclick="deleteProduct('${p.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

$('inv-search').addEventListener('input', e => renderInventory(e.target.value.toLowerCase()));

$('add-product-btn').addEventListener('click', () => openModal('add', 'product'));

function openEditProduct(id) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  state.editId = id;
  openModal('edit', 'product', p);
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  state.products = state.products.filter(p => p.id !== id);
  renderInventory();
  renderDashboard();
  showToast('Product deleted.');
}

// ===== SALES =====
function renderSales(filter = '') {
  const items = state.sales.filter(s =>
    s.customer.toLowerCase().includes(filter) ||
    s.product.toLowerCase().includes(filter) ||
    s.id.toLowerCase().includes(filter)
  );
  $('sales-body').innerHTML = items.map(s => `
    <tr>
      <td><span style="color:var(--accent)">${s.id}</span></td>
      <td style="color:var(--text-muted);font-size:0.7rem">${s.date}</td>
      <td>${s.customer}</td>
      <td>${s.product}</td>
      <td>${s.qty}</td>
      <td style="color:var(--text-primary);font-weight:700">${fmt(s.total)}</td>
      <td>${badgeHtml(s.status)}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-edit" onclick="openEditSale('${s.id}')">Edit</button>
          <button class="btn btn-danger" onclick="deleteSale('${s.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

$('sale-search').addEventListener('input', e => renderSales(e.target.value.toLowerCase()));
$('add-sale-btn').addEventListener('click', () => openModal('add', 'sale'));

function openEditSale(id) {
  const s = state.sales.find(x => x.id === id);
  if (!s) return;
  state.editId = id;
  openModal('edit', 'sale', s);
}

function deleteSale(id) {
  if (!confirm('Delete this sale?')) return;
  state.sales = state.sales.filter(s => s.id !== id);
  renderSales();
  renderDashboard();
  showToast('Sale deleted.');
}

// ===== CUSTOMERS =====
function renderCustomers(filter = '') {
  const items = state.customers.filter(c =>
    c.name.toLowerCase().includes(filter) ||
    c.email.toLowerCase().includes(filter) ||
    c.phone.includes(filter)
  );
  $('customers-body').innerHTML = items.map(c => `
    <tr>
      <td><span style="color:var(--accent)">${c.id}</span></td>
      <td style="color:var(--text-primary)">${c.name}</td>
      <td style="color:var(--text-secondary)">${c.email}</td>
      <td>${c.phone}</td>
      <td style="color:var(--positive);font-weight:700">${fmt(c.spent)}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-edit" onclick="openEditCustomer('${c.id}')">Edit</button>
          <button class="btn btn-danger" onclick="deleteCustomer('${c.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

$('cust-search').addEventListener('input', e => renderCustomers(e.target.value.toLowerCase()));
$('add-customer-btn').addEventListener('click', () => openModal('add', 'customer'));

function openEditCustomer(id) {
  const c = state.customers.find(x => x.id === id);
  if (!c) return;
  state.editId = id;
  openModal('edit', 'customer', c);
}

function deleteCustomer(id) {
  if (!confirm('Delete this customer?')) return;
  state.customers = state.customers.filter(c => c.id !== id);
  renderCustomers();
  renderDashboard();
  showToast('Customer deleted.');
}

// ===== SUPPLIERS =====
function renderSuppliers(filter = '') {
  const items = state.suppliers.filter(s =>
    s.name.toLowerCase().includes(filter) ||
    s.category.toLowerCase().includes(filter)
  );
  $('suppliers-body').innerHTML = items.map(s => `
    <tr>
      <td><span style="color:var(--accent)">${s.id}</span></td>
      <td style="color:var(--text-primary)">${s.name}</td>
      <td>${s.contact}</td>
      <td>${badgeHtml('Active')}</td>
      <td>${s.items} items</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-edit" onclick="openEditSupplier('${s.id}')">Edit</button>
          <button class="btn btn-danger" onclick="deleteSupplier('${s.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

$('sup-search').addEventListener('input', e => renderSuppliers(e.target.value.toLowerCase()));
$('add-supplier-btn').addEventListener('click', () => openModal('add', 'supplier'));

function openEditSupplier(id) {
  const s = state.suppliers.find(x => x.id === id);
  if (!s) return;
  state.editId = id;
  openModal('edit', 'supplier', s);
}

function deleteSupplier(id) {
  if (!confirm('Delete this supplier?')) return;
  state.suppliers = state.suppliers.filter(s => s.id !== id);
  renderSuppliers();
  showToast('Supplier deleted.');
}

// ===== REPORTS =====
function renderReports() {
  const totalRev = state.sales.reduce((a, s) => a + s.total, 0);
  const totalSales = state.sales.length;
  const avgOrder = totalSales ? Math.round(totalRev / totalSales) : 0;

  $('rep-revenue').textContent = fmt(totalRev);
  $('rep-sales').textContent = totalSales;
  $('rep-avg').textContent = fmt(avgOrder);
  $('rep-products').textContent = state.products.length;

  // Category breakdown
  const catMap = {};
  state.sales.forEach(s => {
    const prod = state.products.find(p => p.name === s.product);
    const cat = prod ? prod.category : 'Other';
    catMap[cat] = (catMap[cat] || 0) + s.total;
  });

  const maxVal = Math.max(...Object.values(catMap), 1);
  $('category-report').innerHTML = Object.entries(catMap).map(([cat, val]) => `
    <div class="report-bar-row">
      <div class="report-bar-label">${cat}</div>
      <div class="report-bar-track">
        <div class="report-bar-fill" style="width:${(val / maxVal * 100).toFixed(1)}%"></div>
      </div>
      <div class="report-bar-val">${fmt(val)}</div>
    </div>
  `).join('');
}

// ===== MODAL SYSTEM =====
function openModal(mode, type, data = {}) {
  state.modalMode = mode;
  state.modalType = type;
  const overlay = $('modal-overlay');
  const title = $('modal-title');
  const body = $('modal-body');

  const typeLabel = { product: 'Product', sale: 'Sale', customer: 'Customer', supplier: 'Supplier' }[type];
  title.textContent = (mode === 'add' ? 'Add ' : 'Edit ') + typeLabel;

  body.innerHTML = modalFormHtml(type, data);
  overlay.classList.add('open');
}

function modalFormHtml(type, d = {}) {
  if (type === 'product') return `
    <div class="form-row">
      <div class="form-group">
        <label>Product Name</label>
        <input id="f-name" value="${d.name || ''}" placeholder="e.g. Basmati Rice 5kg" />
      </div>
      <div class="form-group">
        <label>Category</label>
        <select id="f-category">
          ${['Grocery','Stationery','Health','Home Care','Electronics','Other'].map(c =>
            `<option ${d.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Price (₹)</label>
        <input id="f-price" type="number" value="${d.price || ''}" placeholder="0" />
      </div>
      <div class="form-group">
        <label>Stock Qty</label>
        <input id="f-stock" type="number" value="${d.stock || ''}" placeholder="0" />
      </div>
    </div>
    <div class="form-group">
      <label>Low Stock Threshold</label>
      <input id="f-threshold" type="number" value="${d.threshold || 10}" placeholder="10" />
    </div>
  `;

  if (type === 'sale') {
    const productOptions = state.products.map(p =>
      `<option ${d.product === p.name ? 'selected' : ''}>${p.name}</option>`).join('');
    const customerOptions = state.customers.map(c =>
      `<option ${d.customer === c.name ? 'selected' : ''}>${c.name}</option>`).join('');
    return `
      <div class="form-row">
        <div class="form-group">
          <label>Customer</label>
          <select id="f-customer">${customerOptions}</select>
        </div>
        <div class="form-group">
          <label>Product</label>
          <select id="f-product">${productOptions}</select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Quantity</label>
          <input id="f-qty" type="number" value="${d.qty || 1}" min="1" />
        </div>
        <div class="form-group">
          <label>Total (₹)</label>
          <input id="f-total" type="number" value="${d.total || ''}" placeholder="Auto-calculated" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Date</label>
          <input id="f-date" type="date" value="${d.date || new Date().toISOString().split('T')[0]}" />
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="f-status">
            ${['Completed','Pending','Cancelled'].map(s =>
              `<option ${d.status === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>
      </div>
    `;
  }

  if (type === 'customer') return `
    <div class="form-row">
      <div class="form-group">
        <label>Full Name</label>
        <input id="f-name" value="${d.name || ''}" placeholder="e.g. Ravi Kumar" />
      </div>
      <div class="form-group">
        <label>Phone</label>
        <input id="f-phone" value="${d.phone || ''}" placeholder="9876543210" />
      </div>
    </div>
    <div class="form-group">
      <label>Email</label>
      <input id="f-email" type="email" value="${d.email || ''}" placeholder="name@email.com" />
    </div>
    <div class="form-group">
      <label>Total Spent (₹)</label>
      <input id="f-spent" type="number" value="${d.spent || 0}" placeholder="0" />
    </div>
  `;

  if (type === 'supplier') return `
    <div class="form-group">
      <label>Supplier Name</label>
      <input id="f-name" value="${d.name || ''}" placeholder="e.g. Sri Lakshmi Traders" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Contact Number</label>
        <input id="f-contact" value="${d.contact || ''}" placeholder="9876543210" />
      </div>
      <div class="form-group">
        <label>Category</label>
        <select id="f-category">
          ${['Grocery','Stationery','Health','Home Care','Electronics','Other'].map(c =>
            `<option ${d.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Number of Items Supplied</label>
      <input id="f-items" type="number" value="${d.items || ''}" placeholder="0" />
    </div>
  `;
}

// ===== MODAL SAVE =====
$('modal-save').addEventListener('click', () => {
  const { modalMode, modalType, editId } = state;

  if (modalType === 'product') {
    const name = $('f-name').value.trim();
    const category = $('f-category').value;
    const price = parseFloat($('f-price').value);
    const stock = parseInt($('f-stock').value);
    const threshold = parseInt($('f-threshold').value) || 10;

    if (!name || isNaN(price) || isNaN(stock)) return showToast('Please fill all fields.');

    if (modalMode === 'add') {
      state.products.push({ id: genId('SKU', state.products), name, category, price, stock, threshold });
      showToast('Product added successfully.');
    } else {
      const p = state.products.find(x => x.id === editId);
      Object.assign(p, { name, category, price, stock, threshold });
      showToast('Product updated.');
    }
    renderInventory($('inv-search').value.toLowerCase());
  }

  else if (modalType === 'sale') {
    const customer = $('f-customer').value;
    const product = $('f-product').value;
    const qty = parseInt($('f-qty').value);
    const total = parseFloat($('f-total').value);
    const date = $('f-date').value;
    const status = $('f-status').value;

    if (!customer || !product || isNaN(qty) || isNaN(total)) return showToast('Please fill all fields.');

    if (modalMode === 'add') {
      state.sales.unshift({ id: genId('SAL', state.sales), date, customer, product, qty, total, status });
      showToast('Sale recorded.');
    } else {
      const s = state.sales.find(x => x.id === editId);
      Object.assign(s, { customer, product, qty, total, date, status });
      showToast('Sale updated.');
    }
    renderSales($('sale-search').value.toLowerCase());
  }

  else if (modalType === 'customer') {
    const name = $('f-name').value.trim();
    const phone = $('f-phone').value.trim();
    const email = $('f-email').value.trim();
    const spent = parseFloat($('f-spent').value) || 0;

    if (!name || !phone) return showToast('Name and phone are required.');

    if (modalMode === 'add') {
      state.customers.push({ id: genId('C', state.customers), name, email, phone, spent });
      showToast('Customer added.');
    } else {
      const c = state.customers.find(x => x.id === editId);
      Object.assign(c, { name, email, phone, spent });
      showToast('Customer updated.');
    }
    renderCustomers($('cust-search').value.toLowerCase());
  }

  else if (modalType === 'supplier') {
    const name = $('f-name').value.trim();
    const contact = $('f-contact').value.trim();
    const category = $('f-category').value;
    const items = parseInt($('f-items').value) || 0;

    if (!name || !contact) return showToast('Name and contact are required.');

    if (modalMode === 'add') {
      state.suppliers.push({ id: genId('SUP', state.suppliers), name, contact, category, items });
      showToast('Supplier added.');
    } else {
      const s = state.suppliers.find(x => x.id === editId);
      Object.assign(s, { name, contact, category, items });
      showToast('Supplier updated.');
    }
    renderSuppliers($('sup-search').value.toLowerCase());
  }

  closeModal();
  renderDashboard();
});

function closeModal() {
  $('modal-overlay').classList.remove('open');
  state.modalMode = null;
  state.modalType = null;
  state.editId = null;
}

$('modal-close').addEventListener('click', closeModal);
$('modal-cancel').addEventListener('click', closeModal);
$('modal-overlay').addEventListener('click', e => {
  if (e.target === $('modal-overlay')) closeModal();
});

// ===== GLOBAL SEARCH =====
$('global-search').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  if (!q) return;
  // Auto-switch to matching section
  if (state.products.some(p => p.name.toLowerCase().includes(q))) {
    document.querySelector('[data-section="inventory"]').click();
    $('inv-search').value = e.target.value;
    renderInventory(q);
  } else if (state.customers.some(c => c.name.toLowerCase().includes(q))) {
    document.querySelector('[data-section="customers"]').click();
    $('cust-search').value = e.target.value;
    renderCustomers(q);
  } else if (state.sales.some(s => s.customer.toLowerCase().includes(q) || s.product.toLowerCase().includes(q))) {
    document.querySelector('[data-section="sales"]').click();
    $('sale-search').value = e.target.value;
    renderSales(q);
  }
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if ((e.ctrlKey || e.metaKey) && e.key === '/') {
    e.preventDefault();
    $('global-search').focus();
  }
});

// ===== INIT =====
function init() {
  renderDashboard();
  renderInventory();
  renderSales();
  renderCustomers();
  renderSuppliers();
}

init();
