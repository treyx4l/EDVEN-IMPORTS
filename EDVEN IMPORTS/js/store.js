// Store page functionality with cart
const productsDiv = document.getElementById('products')
const productModal = document.getElementById('productModal')
const checkoutModal = document.getElementById('checkoutModal')
const cartItems = document.getElementById('cartItems')
const cartBadge = document.getElementById('cartBadge')
const checkoutCartItems = document.getElementById('checkoutCartItems')
const checkoutTotal = document.getElementById('checkoutTotal')

// Cart state
let cart = JSON.parse(localStorage.getItem('cart')) || []
let currentProduct = null

// Filter and pagination state
let selectedCategory = 'All'
let searchQuery = ''
let sortBy = 'newest'
let priceFilter = 'all'
let currentPage = 1
const productsPerPage = 12
let allProducts = []
let filteredProducts = []

// Initialize cart display
updateCartDisplay()

function filterByCategory(category, event) {
  selectedCategory = category
  currentPage = 1 // Reset to first page
  // Update active filter button
  document.querySelectorAll('.filter-btn-material').forEach(btn => {
    btn.classList.remove('active')
  })
  if (event && event.target) {
    event.target.classList.add('active')
  }
  applyFilters()
}

function handleSearch() {
  const searchInput = document.getElementById('searchInput')
  searchQuery = searchInput.value.toLowerCase().trim()
  const clearBtn = document.getElementById('clearSearchBtn')

  if (searchQuery) {
    clearBtn.style.display = 'block'
  } else {
    clearBtn.style.display = 'none'
  }

  currentPage = 1 // Reset to first page
  applyFilters()
}

function clearSearch() {
  document.getElementById('searchInput').value = ''
  searchQuery = ''
  document.getElementById('clearSearchBtn').style.display = 'none'
  currentPage = 1
  applyFilters()
}

function applyFilters() {
  sortBy = document.getElementById('sortSelect').value
  priceFilter = document.getElementById('priceFilter').value

  // Filter products
  filteredProducts = allProducts.filter(product => {
    // Category filter
    const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory

    // Search filter
    const searchMatch = !searchQuery ||
      product.name.toLowerCase().includes(searchQuery) ||
      (product.description && product.description.toLowerCase().includes(searchQuery))

    // Price filter
    let priceMatch = true
    if (priceFilter !== 'all') {
      const price = product.price || 0
      switch (priceFilter) {
        case '0-100':
          priceMatch = price >= 0 && price <= 100
          break
        case '100-500':
          priceMatch = price > 100 && price <= 500
          break
        case '500-1000':
          priceMatch = price > 500 && price <= 1000
          break
        case '1000+':
          priceMatch = price > 1000
          break
      }
    }

    return categoryMatch && searchMatch && priceMatch
  })

  // Sort products
  filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return (b.createdAt || 0) - (a.createdAt || 0)
      case 'oldest':
        return (a.createdAt || 0) - (b.createdAt || 0)
      case 'price-low':
        return (a.price || 0) - (b.price || 0)
      case 'price-high':
        return (b.price || 0) - (a.price || 0)
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '')
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '')
      default:
        return 0
    }
  })

  // Update counts
  updateProductsCount()

  // Render paginated products
  renderPaginatedProducts()
}

function renderProducts(snap) {
  allProducts = []

  snap.forEach(item => {
    const p = item.val()
    p.id = item.key
    allProducts.push(p)
  })

  // Apply filters and render
  applyFilters()
}

function renderPaginatedProducts() {
  productsDiv.innerHTML = ''

  if (filteredProducts.length === 0) {
    productsDiv.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;" data-aos="fade-up">
        <i class="fas fa-search" style="font-size: 3rem; color: var(--text-secondary); opacity: 0.3; margin-bottom: 1rem;"></i>
        <p style="color: var(--text-secondary); font-size: 1.1rem;">No products found matching your criteria</p>
        <button onclick="clearAllFilters()" class="material-btn material-btn-outlined" style="margin-top: 1rem;">
          <i class="fas fa-times"></i> Clear Filters
        </button>
      </div>
    `
    document.getElementById('pagination').innerHTML = ''
    AOS.refresh()
    return
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const endIndex = startIndex + productsPerPage
  const pageProducts = filteredProducts.slice(startIndex, endIndex)

  // Render products for current page
  let delay = 0
  pageProducts.forEach(p => {
    const productCard = document.createElement('div')
    productCard.className = 'product-card-material'
    productCard.setAttribute('data-aos', 'fade-up')
    productCard.setAttribute('data-aos-delay', delay)

    // Escape special characters for safe HTML insertion
    const safeImage = (p.image || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')
    const safeName = (p.name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')
    const safeCategory = (p.category || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')
    const safeDescription = (p.description || 'No description available').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, '<br>')

    productCard.innerHTML = `
      <img src="${p.image || 'https://via.placeholder.com/400'}" alt="${p.name || 'Product'}" class="product-image-material" />
      <div class="product-info-material">
        <span class="product-category-material">${p.category || 'Uncategorized'}</span>
        <h3 class="product-name-material">${p.name || 'Unnamed Product'}</h3>
        <p class="product-price-material">₵${p.price || '0'}</p>
        <button onclick="openProductModal('${p.id}', '${safeImage}', '${safeName}', ${p.price || 0}, '${safeCategory}', '${safeDescription}')" class="material-btn material-btn-primary" style="width: 100%; margin-top: 1rem; padding: 12px;">
          <i class="fas fa-shopping-bag"></i> Buy Now
        </button>
      </div>
    `

    productsDiv.appendChild(productCard)
    delay += 50
  })

  // Render pagination
  renderPagination(totalPages)

  AOS.refresh()
}

function renderPagination(totalPages) {
  const paginationDiv = document.getElementById('pagination')

  if (totalPages <= 1) {
    paginationDiv.innerHTML = ''
    return
  }

  let paginationHTML = ''

  // Previous button
  paginationHTML += `
    <button onclick="goToPage(${currentPage - 1})" class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''}>
      <i class="fas fa-chevron-left"></i>
    </button>
  `

  // Page numbers
  const maxVisiblePages = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  if (startPage > 1) {
    paginationHTML += `<button onclick="goToPage(1)" class="pagination-btn">1</button>`
    if (startPage > 2) {
      paginationHTML += `<span style="padding: 0 8px; color: var(--text-secondary);">...</span>`
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button onclick="goToPage(${i})" class="pagination-btn ${i === currentPage ? 'active' : ''}">
        ${i}
      </button>
    `
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `<span style="padding: 0 8px; color: var(--text-secondary);">...</span>`
    }
    paginationHTML += `<button onclick="goToPage(${totalPages})" class="pagination-btn">${totalPages}</button>`
  }

  // Next button
  paginationHTML += `
    <button onclick="goToPage(${currentPage + 1})" class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''}>
      <i class="fas fa-chevron-right"></i>
    </button>
  `

  paginationDiv.innerHTML = paginationHTML
}

function goToPage(page) {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  if (page >= 1 && page <= totalPages) {
    currentPage = page
    renderPaginatedProducts()
    // Scroll to top of products section
    document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function updateProductsCount() {
  const showingCount = Math.min(currentPage * productsPerPage, filteredProducts.length)
  const startCount = filteredProducts.length > 0 ? (currentPage - 1) * productsPerPage + 1 : 0

  document.getElementById('showingCount').textContent =
    filteredProducts.length > 0 ? `${startCount}-${showingCount}` : '0'
  document.getElementById('totalCount').textContent = filteredProducts.length
}

function clearAllFilters() {
  document.getElementById('searchInput').value = ''
  searchQuery = ''
  document.getElementById('clearSearchBtn').style.display = 'none'
  selectedCategory = 'All'
  document.querySelectorAll('.filter-btn-material').forEach(btn => {
    btn.classList.remove('active')
    if (btn.textContent.trim() === 'All') {
      btn.classList.add('active')
    }
  })
  document.getElementById('sortSelect').value = 'newest'
  document.getElementById('priceFilter').value = 'all'
  currentPage = 1
  applyFilters()
}

// Listen for products and render
db.on('value', snap => {
  renderProducts(snap)
})

function openProductModal(id, img, title, price, category, description) {
  currentProduct = { id, img, title, price, category, description }
  document.getElementById('modalImg').src = img
  document.getElementById('modalTitle').textContent = title
  document.getElementById('modalCategory').textContent = category
  document.getElementById('modalPrice').textContent = `₵${price}`

  // Set description, handling HTML line breaks
  const descriptionElement = document.getElementById('modalDescription')
  if (description && description !== 'No description available') {
    descriptionElement.innerHTML = description.replace(/\\n/g, '<br>').replace(/\n/g, '<br>')
    descriptionElement.classList.remove('text-base-content/50', 'italic')
    descriptionElement.classList.add('text-base-content/70')
  } else {
    descriptionElement.textContent = 'No description available for this product.'
    descriptionElement.classList.add('text-base-content/50', 'italic')
  }

  productModal.classList.add('active')
  document.body.style.overflow = 'hidden'
}

function addToCartFromModal() {
  if (currentProduct) {
    addToCart(currentProduct.id, currentProduct.title, currentProduct.price, currentProduct.img, currentProduct.category)
    productModal.classList.remove('active')
    document.body.style.overflow = 'auto'
  }
}

function closeProductModal() {
  productModal.classList.remove('active')
  document.body.style.overflow = 'auto'
}

function addToCart(productId, name, price, image, category) {
  const existingItem = cart.find(item => item.id === productId)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({
      id: productId,
      name,
      price: parseFloat(price),
      image,
      category,
      quantity: 1
    })
  }

  localStorage.setItem('cart', JSON.stringify(cart))
  updateCartDisplay()

  // Show toast notification
  showToast('Product added to cart!')
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId)
  localStorage.setItem('cart', JSON.stringify(cart))
  updateCartDisplay()
  updateCheckoutDisplay()
}

function updateQuantity(productId, change) {
  const item = cart.find(item => item.id === productId)
  if (item) {
    item.quantity += change
    if (item.quantity <= 0) {
      removeFromCart(productId)
      return
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    updateCartDisplay()
    updateCheckoutDisplay()
  }
}

function updateCartDisplay() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  cartBadge.textContent = totalItems

  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Your cart is empty</p>'
    return
  }

  cartItems.innerHTML = cart.map(item => `
    <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid var(--bg-secondary);">
      <img src="${item.image}" alt="${item.name}" style="width: 64px; height: 64px; object-fit: cover; border-radius: 8px;" />
      <div style="flex: 1;">
        <p style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem; color: var(--text-primary); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${item.name}</p>
        <p style="color: var(--primary); font-weight: 700; font-size: 0.875rem;">₵${item.price} × ${item.quantity}</p>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <button onclick="updateQuantity('${item.id}', -1)" class="material-btn material-btn-icon" style="width: 32px; height: 32px; padding: 0; font-size: 18px;">-</button>
        <span style="font-weight: 600; font-size: 0.875rem; min-width: 24px; text-align: center;">${item.quantity}</span>
        <button onclick="updateQuantity('${item.id}', 1)" class="material-btn material-btn-icon" style="width: 32px; height: 32px; padding: 0; font-size: 18px;">+</button>
      </div>
      <button onclick="removeFromCart('${item.id}')" class="material-btn" style="width: 32px; height: 32px; padding: 0; background: #f44336; color: white; border-radius: 50%;">×</button>
    </div>
  `).join('')
}

function openCheckout() {
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error')
    return
  }
  updateCheckoutDisplay()
  checkoutModal.classList.add('active')
  document.body.style.overflow = 'hidden'
}

function closeCheckoutModal() {
  checkoutModal.classList.remove('active')
  document.body.style.overflow = 'auto'
}

function updateCheckoutDisplay() {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  checkoutTotal.textContent = `₵${total.toFixed(2)}`

  checkoutCartItems.innerHTML = cart.map(item => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-bottom: 1px solid var(--bg-secondary);">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <img src="${item.image}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px;" />
        <div>
          <p style="font-weight: 600; font-size: 0.875rem; color: var(--text-primary);">${item.name}</p>
          <p style="font-size: 0.75rem; color: var(--text-secondary);">${item.category}</p>
        </div>
      </div>
      <div style="text-align: right;">
        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Qty: ${item.quantity}</p>
        <p style="font-weight: 700; color: var(--primary);">₵${(item.price * item.quantity).toFixed(2)}</p>
      </div>
    </div>
  `).join('')
}

// Handle checkout form submission
document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault()

  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error')
    return
  }

  const orderData = {
    name: document.getElementById('customerName').value,
    email: document.getElementById('customerEmail').value,
    phone: document.getElementById('customerPhone').value,
    region: document.getElementById('customerRegion').value,
    town: document.getElementById('customerTown').value,
    address: document.getElementById('customerAddress').value,
    country: document.getElementById('customerCountry').value,
    items: cart,
    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    status: 'pending',
    createdAt: Date.now(),
    timestamp: new Date().toISOString()
  }

  try {
    // Save to Firebase
    const ordersRef = firebase.database().ref('orders')
    const orderRef = ordersRef.push(orderData)
    const orderId = orderRef.key

    // Send WhatsApp message
    sendWhatsAppOrder(orderData, orderId)

    // Clear cart
    cart = []
    localStorage.setItem('cart', JSON.stringify(cart))
    updateCartDisplay()

    // Close modal and show success
    closeCheckoutModal()
    showToast('Order placed successfully! Order ID: ' + orderId, 'success')

    // Reset form
    document.getElementById('checkoutForm').reset()

  } catch (error) {
    console.error('Error placing order:', error)
    showToast('Error placing order. Please try again.', 'error')
  }
})

function sendWhatsAppOrder(orderData, orderId) {
  // WhatsApp number - Ghana format: 233XXXXXXXXX (country code + number without leading 0)
  // Remove any spaces, dashes, or special characters
  const whatsappNumber = '233544570238'.replace(/[^0-9]/g, '')

  // Build the message
  let message = `📦 *New Order - Edven Import Hub*\n\n`
  message += `*Order ID:* ${orderId}\n\n`
  message += `*Customer Details:*\n`
  message += `Name: ${orderData.name}\n`
  message += `Email: ${orderData.email}\n`
  message += `Phone: ${orderData.phone}\n`
  message += `Region: ${orderData.region}\n`
  message += `Town: ${orderData.town}\n`
  message += `Address: ${orderData.address}\n`
  message += `Country: ${orderData.country}\n\n`
  message += `*Order Items:*\n`

  orderData.items.forEach((item, index) => {
    message += `${index + 1}. ${item.name} (${item.category})\n`
    message += `   Qty: ${item.quantity} × ₵${item.price} = ₵${(item.price * item.quantity).toFixed(2)}\n`
  })

  message += `\n*Total: ₵${orderData.total.toFixed(2)}*\n`
  message += `\n*Status: ${orderData.status}*\n`
  message += `*Date: ${new Date(orderData.timestamp).toLocaleString()}*`

  // Encode the message properly - handle special characters
  const encodedMessage = encodeURIComponent(message)

  // Use the correct WhatsApp API format
  // Format: https://wa.me/PHONENUMBER?text=MESSAGE (no + sign needed)
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

  // Alternative: WhatsApp Web format (works if app is not installed)
  const whatsappWebUrl = `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`

  // Try to open WhatsApp
  // First try wa.me (opens app if installed, web if not)
  // If that fails, try web.whatsapp.com directly
  const link = document.createElement('a')
  link.href = whatsappUrl
  link.target = '_blank'
  link.rel = 'noopener noreferrer'

  // Add to DOM temporarily to trigger click
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Log for debugging
  console.log('WhatsApp URL:', whatsappUrl)
  console.log('WhatsApp Number:', whatsappNumber)
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
window.openProductModal = openProductModal
window.addToCartFromModal = addToCartFromModal
window.closeProductModal = closeProductModal
window.closeCheckoutModal = closeCheckoutModal
window.handleSearch = handleSearch
window.clearSearch = clearSearch
window.applyFilters = applyFilters
window.goToPage = goToPage
window.clearAllFilters = clearAllFilters

// Close modals on backdrop click
document.addEventListener('click', (e) => {
  if (e.target === productModal) {
    closeProductModal()
  }
  if (e.target === checkoutModal) {
    closeCheckoutModal()
  }
})

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProductModal()
    closeCheckoutModal()
  }
})
window.removeFromCart = removeFromCart
window.updateQuantity = updateQuantity
window.openCheckout = openCheckout
window.filterByCategory = filterByCategory
