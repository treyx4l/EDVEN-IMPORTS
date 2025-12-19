// db is already declared in firebase.js
// Use the global db variable from firebase.js

let editingProductId = null

function addProduct() {
  // Get db reference if not already available
  const db = firebase.database().ref("products")
  const name = document.getElementById('pname').value.trim()
  const price = document.getElementById('pprice').value.trim()
  const image = document.getElementById('pimage').value.trim()
  const category = document.getElementById('pcategory').value
  const description = document.getElementById('pdescription').value.trim()

  if (!name || !price || !image) {
    showToast('Name, Price, and Image are required', 'error')
    return
  }

  // Validate price is a number
  if (isNaN(price) || parseFloat(price) <= 0) {
    showToast('Please enter a valid price', 'error')
    return
  }

  db.push({
    name,
    price: parseFloat(price),
    image,
    category,
    description: description || 'No description available',
    createdAt: Date.now()
  })
  .then(() => {
    showToast('Product added successfully!', 'success')
    resetAddForm()
  })
  .catch(err => {
    showToast('Error: ' + err.message, 'error')
  })
}

function resetAddForm() {
  document.getElementById('pname').value = ""
  document.getElementById('pprice').value = ""
  document.getElementById('pimage').value = ""
  document.getElementById('pcategory').value = "Home Appliances"
  document.getElementById('pdescription').value = ""
}

function editProduct(productId) {
  editingProductId = productId
  const db = firebase.database().ref("products")
  
  db.child(productId).once('value', snap => {
    const product = snap.val()
    if (!product) {
      showToast('Product not found', 'error')
      return
    }

    // Fill edit modal
    document.getElementById('editPname').value = product.name || ''
    document.getElementById('editPprice').value = product.price || ''
    document.getElementById('editPimage').value = product.image || ''
    document.getElementById('editPcategory').value = product.category || 'Home Appliances'
    document.getElementById('editPdescription').value = product.description || ''

    // Show edit modal
    const modal = document.getElementById('editProductModal')
    if (modal) {
      modal.classList.add('active')
      document.body.style.overflow = 'hidden'
    }
  })
}

function saveProductEdit() {
  if (!editingProductId) {
    showToast('No product selected for editing', 'error')
    return
  }

  const db = firebase.database().ref("products")
  const name = document.getElementById('editPname').value.trim()
  const price = document.getElementById('editPprice').value.trim()
  const image = document.getElementById('editPimage').value.trim()
  const category = document.getElementById('editPcategory').value
  const description = document.getElementById('editPdescription').value.trim()

  if (!name || !price || !image) {
    showToast('Name, Price, and Image are required', 'error')
    return
  }

  // Validate price is a number
  if (isNaN(price) || parseFloat(price) <= 0) {
    showToast('Please enter a valid price', 'error')
    return
  }

  db.child(editingProductId).update({
    name,
    price: parseFloat(price),
    image,
    category,
    description: description || 'No description available',
    updatedAt: Date.now()
  })
  .then(() => {
    showToast('Product updated successfully!', 'success')
    closeEditModal()
  })
  .catch(err => {
    showToast('Error: ' + err.message, 'error')
  })
}

function deleteProduct(productId, productName) {
  if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
    return
  }

  const db = firebase.database().ref("products")
  db.child(productId).remove()
    .then(() => {
      showToast('Product deleted successfully!', 'success')
    })
    .catch(err => {
      showToast('Error: ' + err.message, 'error')
    })
}

function renderProducts() {
  const productsList = document.getElementById('productsList')
  const productCount = document.getElementById('productCount')
  const modalProductCount = document.getElementById('modalProductCount')
  const db = firebase.database().ref("products")

  db.on('value', snap => {
    if (!productsList) return
    
    productsList.innerHTML = ''
    const products = []
    
    snap.forEach(item => {
      const product = item.val()
      product.id = item.key
      products.push(product)
    })

    // Update count
    const countText = `${products.length} product${products.length !== 1 ? 's' : ''}`
    if (productCount) productCount.textContent = products.length
    if (modalProductCount) modalProductCount.textContent = products.length

    if (products.length === 0) {
      productsList.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
          <i class="fas fa-box-open" style="font-size: 4rem; color: var(--text-secondary); opacity: 0.3; margin-bottom: 1rem;"></i>
          <p style="color: var(--text-secondary); font-size: 1.1rem;">No products yet. Add your first product above!</p>
        </div>
      `
      return
    }

    // Sort by creation date (newest first)
    products.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

    products.forEach((product, index) => {
      const productCard = document.createElement('div')
      productCard.className = 'product-card-material'
      productCard.setAttribute('data-aos', 'fade-up')
      productCard.setAttribute('data-aos-delay', index * 50)

      const safeName = (product.name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')

      productCard.innerHTML = `
        <img src="${product.image || 'https://via.placeholder.com/400'}" alt="${product.name || 'Product'}" 
          class="product-image-material" />
        <div class="product-info-material">
          <span class="product-category-material">${product.category || 'Uncategorized'}</span>
          <h3 class="product-name-material">${product.name || 'Unnamed Product'}</h3>
          <p class="product-price-material">₵${product.price || '0'}</p>
          <p style="color: var(--text-secondary); font-size: 0.875rem; margin: 0.5rem 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${product.description || 'No description'}</p>
          <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
            <button onclick="editProduct('${product.id}')" class="material-btn material-btn-primary" style="flex: 1; padding: 10px;">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button onclick="deleteProduct('${product.id}', '${safeName}')" 
              class="material-btn" style="flex: 1; padding: 10px; background: #f44336; color: white;">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `

      productsList.appendChild(productCard)
    })
    
    AOS.refresh()
  })
}

function openProductsModal() {
  const modal = document.getElementById('productsModal')
  if (modal) {
    modal.classList.add('active')
    document.body.style.overflow = 'hidden'
  }
}

function closeProductsModal() {
  const modal = document.getElementById('productsModal')
  if (modal) {
    modal.classList.remove('active')
    document.body.style.overflow = 'auto'
  }
}

function closeEditModal() {
  const modal = document.getElementById('editProductModal')
  if (modal) {
    modal.classList.remove('active')
    document.body.style.overflow = 'auto'
    editingProductId = null
  }
}

// Close modals on backdrop click
document.addEventListener('click', (e) => {
  const productsModal = document.getElementById('productsModal')
  const editModal = document.getElementById('editProductModal')
  
  if (productsModal && e.target === productsModal) {
    closeProductsModal()
  }
  if (editModal && e.target === editModal) {
    closeEditModal()
  }
})

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProductsModal()
    closeEditModal()
  }
})

// Initialize products list on page load
if (document.getElementById('productsList')) {
  renderProducts()
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
window.editProduct = editProduct
window.saveProductEdit = saveProductEdit
window.deleteProduct = deleteProduct
window.openProductsModal = openProductsModal
window.closeProductsModal = closeProductsModal
window.closeEditModal = closeEditModal
