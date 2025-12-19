// Orders management page
const ordersContainer = document.getElementById('ordersContainer')
const orderModal = document.getElementById('orderModal')
const orderDetails = document.getElementById('orderDetails')
const ordersRef = firebase.database().ref('orders')
let currentFilter = 'all'

function filterOrders(status) {
  currentFilter = status
  
  // Update active filter button
  document.querySelectorAll('.filter-btn-material').forEach(btn => {
    btn.classList.remove('active')
    if (btn.getAttribute('data-filter') === status) {
      btn.classList.add('active')
    }
  })
  
  // Re-render orders
  ordersRef.once('value', snap => {
    renderOrders(snap)
  })
}

function renderOrders(snap) {
  ordersContainer.innerHTML = ''
  const orders = []
  
  snap.forEach(item => {
    const order = item.val()
    order.id = item.key
    if (currentFilter === 'all' || order.status === currentFilter) {
      orders.push(order)
    }
  })
  
  if (orders.length === 0) {
    ordersContainer.innerHTML = `
      <div style="text-align: center; padding: 3rem;" data-aos="fade-up">
        <p style="color: var(--text-secondary); font-size: 1.1rem;">No orders found</p>
      </div>
    `
    return
  }
  
  // Sort by date (newest first)
  orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  
  orders.forEach((order, index) => {
    const orderCard = document.createElement('div')
    orderCard.className = 'material-card material-card-elevated'
    orderCard.setAttribute('data-aos', 'fade-up')
    orderCard.setAttribute('data-aos-delay', index * 50)
    
    const statusBadge = getStatusBadge(order.status)
    const total = order.total || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const date = order.timestamp ? new Date(order.timestamp).toLocaleString() : 'N/A'
    
    orderCard.innerHTML = `
      <div style="padding: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
          <div>
            <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary);">Order #${order.id.substring(0, 8)}</h2>
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem;">${order.name} • ${order.email}</p>
            <p style="font-size: 0.875rem; color: var(--text-secondary);">${order.phone}</p>
          </div>
          ${statusBadge}
        </div>
        
        <div style="height: 1px; background: var(--bg-secondary); margin: 1.5rem 0;"></div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
          <div>
            <p style="font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem;">Delivery Address</p>
            <p style="font-size: 0.875rem; color: var(--text-primary); margin-bottom: 0.25rem;">${order.address}, ${order.town}</p>
            <p style="font-size: 0.875rem; color: var(--text-primary);">${order.region}, ${order.country}</p>
          </div>
          <div>
            <p style="font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem;">Order Info</p>
            <p style="font-size: 0.875rem; color: var(--text-primary); margin-bottom: 0.25rem;">Date: ${date}</p>
            <p style="font-size: 0.875rem; color: var(--text-primary); margin-bottom: 0.5rem;">Items: ${order.items.length} product(s)</p>
            <p style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">Total: ₵${total.toFixed(2)}</p>
          </div>
        </div>
        
        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; flex-wrap: wrap;">
          <button onclick="viewOrderDetails('${order.id}')" class="material-btn material-btn-primary" style="padding: 10px 20px;">
            View Details
          </button>
          <div style="position: relative;">
            <button onclick="toggleStatusDropdown('${order.id}')" class="material-btn material-btn-outlined" style="padding: 10px 20px;">
              Update Status <i class="fas fa-chevron-down" style="margin-left: 8px; font-size: 12px;"></i>
            </button>
            <div id="statusDropdown-${order.id}" style="position: absolute; top: calc(100% + 5px); right: 0; background: var(--surface); border-radius: var(--border-radius); box-shadow: var(--shadow-lg); min-width: 180px; display: none; z-index: 10; border: 1px solid var(--bg-secondary);">
              <button onclick="updateOrderStatus('${order.id}', 'pending')" style="width: 100%; padding: 12px 16px; text-align: left; background: transparent; border: none; color: var(--text-primary); cursor: pointer; border-bottom: 1px solid var(--bg-secondary); transition: background 0.2s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
                <i class="fas fa-clock" style="margin-right: 8px; color: #ff9800;"></i> Pending
              </button>
              <button onclick="updateOrderStatus('${order.id}', 'processing')" style="width: 100%; padding: 12px 16px; text-align: left; background: transparent; border: none; color: var(--text-primary); cursor: pointer; border-bottom: 1px solid var(--bg-secondary); transition: background 0.2s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
                <i class="fas fa-spinner" style="margin-right: 8px; color: #2196f3;"></i> Processing
              </button>
              <button onclick="updateOrderStatus('${order.id}', 'completed')" style="width: 100%; padding: 12px 16px; text-align: left; background: transparent; border: none; color: var(--text-primary); cursor: pointer; border-bottom: 1px solid var(--bg-secondary); transition: background 0.2s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
                <i class="fas fa-check-circle" style="margin-right: 8px; color: #4caf50;"></i> Completed
              </button>
              <button onclick="updateOrderStatus('${order.id}', 'cancelled')" style="width: 100%; padding: 12px 16px; text-align: left; background: transparent; border: none; color: var(--text-primary); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
                <i class="fas fa-times-circle" style="margin-right: 8px; color: #f44336;"></i> Cancelled
              </button>
            </div>
          </div>
        </div>
      </div>
    `
    
    ordersContainer.appendChild(orderCard)
  })
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[id^="statusDropdown-"]') && !e.target.closest('button[onclick*="toggleStatusDropdown"]')) {
      document.querySelectorAll('[id^="statusDropdown-"]').forEach(dropdown => {
        dropdown.style.display = 'none'
      })
    }
  })
}

function getStatusBadge(status) {
  const badges = {
    pending: '<span style="display: inline-block; padding: 6px 14px; background: #ff9800; color: white; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">Pending</span>',
    processing: '<span style="display: inline-block; padding: 6px 14px; background: #2196f3; color: white; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">Processing</span>',
    completed: '<span style="display: inline-block; padding: 6px 14px; background: #4caf50; color: white; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">Completed</span>',
    cancelled: '<span style="display: inline-block; padding: 6px 14px; background: #f44336; color: white; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">Cancelled</span>'
  }
  return badges[status] || badges.pending
}

function toggleStatusDropdown(orderId) {
  const dropdown = document.getElementById(`statusDropdown-${orderId}`)
  if (dropdown) {
    const isVisible = dropdown.style.display === 'block'
    // Close all dropdowns
    document.querySelectorAll('[id^="statusDropdown-"]').forEach(d => d.style.display = 'none')
    // Toggle current dropdown
    dropdown.style.display = isVisible ? 'none' : 'block'
  }
}

function viewOrderDetails(orderId) {
  ordersRef.child(orderId).once('value', snap => {
    const order = snap.val()
    if (!order) return
    
    const total = order.total || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const date = order.timestamp ? new Date(order.timestamp).toLocaleString() : 'N/A'
    const currentStatus = order.status || 'pending'
    
    orderDetails.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- Order Info -->
        <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: var(--border-radius);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
            <h4 style="font-weight: 700; font-size: 1.25rem; color: var(--text-primary);">Order Information</h4>
            <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
              <label style="color: var(--text-secondary); font-size: 0.875rem; font-weight: 600;">Update Status:</label>
              <select id="statusSelect-${orderId}" class="material-select" style="min-width: 180px;" onchange="updateOrderStatusFromModal('${orderId}')">
                <option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="processing" ${currentStatus === 'processing' ? 'selected' : ''}>Processing</option>
                <option value="completed" ${currentStatus === 'completed' ? 'selected' : ''}>Completed</option>
                <option value="cancelled" ${currentStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; font-size: 0.875rem;">
            <div>
              <p style="color: var(--text-secondary); margin-bottom: 0.25rem;">Order ID</p>
              <p style="font-weight: 600; color: var(--text-primary);">${orderId}</p>
            </div>
            <div>
              <p style="color: var(--text-secondary); margin-bottom: 0.25rem;">Status</p>
              <span id="statusBadge-${orderId}">${getStatusBadge(currentStatus)}</span>
            </div>
            <div>
              <p style="color: var(--text-secondary); margin-bottom: 0.25rem;">Date</p>
              <p style="font-weight: 600; color: var(--text-primary);">${date}</p>
            </div>
            <div>
              <p style="color: var(--text-secondary); margin-bottom: 0.25rem;">Total Amount</p>
              <p style="font-weight: 700; color: var(--primary); font-size: 1.25rem;">₵${total.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <!-- Customer Info -->
        <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: var(--border-radius);">
          <h4 style="font-weight: 700; font-size: 1.25rem; margin-bottom: 1rem; color: var(--text-primary);">Customer Information</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; font-size: 0.875rem;">
            <div>
              <p style="color: var(--text-secondary); margin-bottom: 0.25rem;">Name</p>
              <p style="font-weight: 600; color: var(--text-primary);">${order.name}</p>
            </div>
            <div>
              <p style="color: var(--text-secondary); margin-bottom: 0.25rem;">Email</p>
              <p style="font-weight: 600; color: var(--text-primary);">${order.email}</p>
            </div>
            <div>
              <p style="color: var(--text-secondary); margin-bottom: 0.25rem;">Phone</p>
              <p style="font-weight: 600; color: var(--text-primary);">${order.phone}</p>
            </div>
            <div>
              <p style="color: var(--text-secondary); margin-bottom: 0.25rem;">Region</p>
              <p style="font-weight: 600; color: var(--text-primary);">${order.region}</p>
            </div>
            <div>
              <p style="color: var(--text-secondary); margin-bottom: 0.25rem;">Town</p>
              <p style="font-weight: 600; color: var(--text-primary);">${order.town}</p>
            </div>
            <div>
              <p style="color: var(--text-secondary); margin-bottom: 0.25rem;">Country</p>
              <p style="font-weight: 600; color: var(--text-primary);">${order.country}</p>
            </div>
            <div style="grid-column: 1/-1;">
              <p style="color: var(--text-secondary); margin-bottom: 0.25rem;">Address</p>
              <p style="font-weight: 600; color: var(--text-primary);">${order.address}</p>
            </div>
          </div>
        </div>
        
        <!-- Order Items -->
        <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: var(--border-radius);">
          <h4 style="font-weight: 700; font-size: 1.25rem; margin-bottom: 1rem; color: var(--text-primary);">Order Items</h4>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid var(--bg-primary);">
                  <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">Product</th>
                  <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">Category</th>
                  <th style="padding: 12px; text-align: center; font-weight: 600; color: var(--text-primary);">Quantity</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600; color: var(--text-primary);">Price</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600; color: var(--text-primary);">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map((item, idx) => `
                  <tr style="border-bottom: 1px solid var(--bg-primary); background: ${idx % 2 === 0 ? 'transparent' : 'var(--bg-primary)'};">
                    <td style="padding: 12px;">
                      <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <img src="${item.image}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px;" />
                        <span style="font-weight: 600; color: var(--text-primary);">${item.name}</span>
                      </div>
                    </td>
                    <td style="padding: 12px; color: var(--text-secondary);">${item.category}</td>
                    <td style="padding: 12px; text-align: center; color: var(--text-primary);">${item.quantity}</td>
                    <td style="padding: 12px; text-align: right; color: var(--text-primary);">₵${item.price.toFixed(2)}</td>
                    <td style="padding: 12px; text-align: right; font-weight: 700; color: var(--text-primary);">₵${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="border-top: 2px solid var(--bg-primary);">
                  <td colspan="4" style="padding: 12px; text-align: right; font-weight: 700; color: var(--text-primary);">Total</td>
                  <td style="padding: 12px; text-align: right; font-weight: 700; color: var(--primary); font-size: 1.25rem;">₵${total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    `
    
    orderModal.classList.add('active')
    document.body.style.overflow = 'hidden'
  })
}

function updateOrderStatus(orderId, status) {
  // Close dropdown
  document.querySelectorAll('[id^="statusDropdown-"]').forEach(d => d.style.display = 'none')
  
  ordersRef.child(orderId).update({ status })
    .then(() => {
      showToast('Order status updated successfully!', 'success')
      // Refresh orders
      ordersRef.once('value', snap => {
        renderOrders(snap)
      })
    })
    .catch(error => {
      console.error('Error updating order status:', error)
      showToast('Error updating order status', 'error')
    })
}

function updateOrderStatusFromModal(orderId) {
  const statusSelect = document.getElementById(`statusSelect-${orderId}`)
  const newStatus = statusSelect.value
  
  ordersRef.child(orderId).update({ status: newStatus })
    .then(() => {
      // Update status badge in modal
      const statusBadge = document.getElementById(`statusBadge-${orderId}`)
      if (statusBadge) {
        statusBadge.innerHTML = getStatusBadge(newStatus)
      }
      
      showToast('Order status updated successfully!', 'success')
      
      // Refresh orders list
      ordersRef.once('value', snap => {
        renderOrders(snap)
      })
    })
    .catch(error => {
      console.error('Error updating order status:', error)
      showToast('Error updating order status', 'error')
      // Revert select to previous value
      ordersRef.child(orderId).once('value', snap => {
        const order = snap.val()
        if (order && statusSelect) {
          statusSelect.value = order.status || 'pending'
        }
      })
    })
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div')
  toast.className = `material-toast ${type}`
  toast.innerHTML = `
    <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}" style="font-size: 20px;"></i>
    <span>${message}</span>
  `
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s reverse'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

// Make functions globally available
window.filterOrders = filterOrders
window.viewOrderDetails = viewOrderDetails
window.updateOrderStatus = updateOrderStatus
window.updateOrderStatusFromModal = updateOrderStatusFromModal
window.toggleStatusDropdown = toggleStatusDropdown

// Load orders on page load
ordersRef.on('value', snap => {
  renderOrders(snap)
})

