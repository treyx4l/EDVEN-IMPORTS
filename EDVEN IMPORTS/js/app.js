const productsDiv = document.getElementById('products')
const modal = document.getElementById('modal')
const modalImg = document.getElementById('modalImg')
const modalTitle = document.getElementById('modalTitle')
const modalCategory = document.getElementById('modalCategory')
const modalPrice = document.getElementById('modalPrice')

// Category filter
let selectedCategory = 'All'

function filterByCategory(category, event) {
  selectedCategory = category
  // Update active filter button
  document.querySelectorAll('.filter-btn-material').forEach(btn => {
    btn.classList.remove('active')
  })
  if (event && event.target) {
    event.target.classList.add('active')
  }
  // Re-render with current data
  db.once('value', snap => {
    renderProducts(snap)
  })
}

function renderProducts(snap) {
  productsDiv.innerHTML = ''
  let delay = 0
  const products = []
  
  snap.forEach(item => {
    const p = item.val()
    if (selectedCategory === 'All' || p.category === selectedCategory) {
      products.push(p)
    }
  })
  
  if (products.length === 0) {
    productsDiv.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;" data-aos="fade-up">
        <p style="color: var(--text-secondary); font-size: 1.1rem;">No products found in this category</p>
      </div>
    `
    AOS.refresh()
    return
  }
  
  products.forEach(p => {
    // Escape quotes in product data to prevent XSS
    const safeImage = (p.image || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')
    const safeName = (p.name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')
    const safeCategory = (p.category || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')
    const safePrice = p.price || '0'
    
    const productCard = document.createElement('div')
    productCard.className = 'product-card-material'
    productCard.setAttribute('data-aos', 'fade-up')
    productCard.setAttribute('data-aos-delay', delay)
    productCard.onclick = () => openModal(safeImage, safeName, safePrice, safeCategory)
    
    productCard.innerHTML = `
      <img src="${p.image || 'https://via.placeholder.com/400'}" alt="${p.name || 'Product'}" class="product-image-material" />
      <div class="product-info-material">
        <span class="product-category-material">${p.category || 'Uncategorized'}</span>
        <h3 class="product-name-material">${p.name || 'Unnamed Product'}</h3>
        <p class="product-price-material">₵${safePrice}</p>
      </div>
    `
    
    productsDiv.appendChild(productCard)
    delay += 50
  })
  AOS.refresh()
}

// Listen for products and render
db.on('value', snap => {
  renderProducts(snap)
})

function openModal(img, title, price, category) {
  modalImg.src = img
  modalTitle.innerText = title
  modalCategory.innerText = category
  modalPrice.innerText = '₵' + price
  modal.classList.add('active')
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  modal.classList.remove('active')
  document.body.style.overflow = 'auto'
}

// Close modal on backdrop click
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal()
  }
})

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    closeModal()
  }
})