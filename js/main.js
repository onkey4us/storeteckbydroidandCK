// Navigation scroll effect
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('active');
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('active');
  });
});

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function setTheme(isDark) {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  setTheme(savedTheme === 'dark');
} else {
  setTheme(prefersDark.matches);
}

themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  setTheme(!isDark);
});

prefersDark.addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    setTheme(e.matches);
  }
});

// Scroll reveal animation
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('[data-reveal]').forEach(el => {
  revealObserver.observe(el);
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const navHeight = nav.offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Product Filter
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.products-grid .product-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const filter = btn.dataset.filter;
    
    productCards.forEach(card => {
      const category = card.dataset.category;
      if (filter === 'all' || category === filter) {
        card.style.display = 'block';
        card.style.animation = 'fadeIn 0.4s ease forwards';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// Cart functionality
const cartBtn = document.getElementById('cartBtn');
const mobileCartBtn = document.getElementById('mobileCartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const mobileCartCount = document.getElementById('mobileCartCount');
const cartTotal = document.getElementById('cartTotal');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

function updateCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = count;
  if (mobileCartCount) mobileCartCount.textContent = count;
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotal.textContent = formatPrice(total);
  
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 6h15l-1.5 9h-12z"/>
          <circle cx="9" cy="20" r="1"/>
          <circle cx="18" cy="20" r="1"/>
          <path d="M3 3h3l1 3"/>
        </svg>
        <p>Giỏ hàng trống</p>
      </div>
    `;
  } else {
    cartItems.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item__image">
        <div class="cart-item__info">
          <div class="cart-item__title">${item.name}</div>
          <div class="cart-item__price">${formatPrice(item.price)} x ${item.quantity}</div>
        </div>
        <button class="cart-item__remove" data-index="${index}" aria-label="Xóa">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `).join('');
    
    cartItems.querySelectorAll('.cart-item__remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
      });
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
}

function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.add('active');
  setTimeout(() => {
    toast.classList.remove('active');
  }, 2500);
}

function openCart() {
  cartSidebar.classList.add('active');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartSidebar.classList.remove('active');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
if (mobileCartBtn) mobileCartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// Mobile Navigation Active State
const mobileNavItems = document.querySelectorAll('.mobile-nav__item:not(.mobile-nav__item--cart)');
const sections = document.querySelectorAll('section[id]');

function updateMobileNavActive() {
  const scrollPos = window.scrollY + 200;
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    
    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
      mobileNavItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === '#' + sectionId) {
          item.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', updateMobileNavActive);

// Close cart with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && cartSidebar.classList.contains('active')) {
    closeCart();
  }
});

// Add to cart buttons
document.querySelectorAll('.btn--cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const productCard = btn.closest('.product-card');
    const heroProductInfo = btn.closest('.hero__product-info');
    const heroProduct = btn.closest('.hero__product');
    const productId = btn.dataset.product;
    const price = parseInt(btn.dataset.price);
    
    let name, image;
    
    if (productCard) {
      const titleEl = productCard.querySelector('.product-card__title');
      const imgEl = productCard.querySelector('.product-card__image img');
      name = titleEl ? titleEl.textContent : productId;
      image = imgEl ? imgEl.src : 'https://via.placeholder.com/100';
    } else if (heroProductInfo || heroProduct) {
      const container = heroProduct || heroProductInfo.closest('.hero__product');
      const titleEl = heroProductInfo ? heroProductInfo.querySelector('h3') : null;
      const imgEl = container ? container.querySelector('.hero__product-image') : null;
      name = titleEl ? titleEl.textContent : 'iPhone 15 Pro Max';
      image = imgEl ? imgEl.src : 'https://via.placeholder.com/100';
    } else {
      name = productId;
      image = 'https://via.placeholder.com/100';
    }
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({
        id: productId,
        name: name,
        price: price,
        image: image,
        quantity: 1
      });
    }
    
    updateCart();
    showToast('Đã thêm vào giỏ hàng!');
    
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => {
      btn.style.transform = '';
    }, 150);
  });
});

// Initialize cart
updateCart();

// Newsletter form
const ctaForm = document.querySelector('.cta__form');
if (ctaForm) {
  ctaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = ctaForm.querySelector('input[type="email"]').value;
    if (email) {
      showToast('Đăng ký thành công! Cảm ơn bạn.');
      ctaForm.reset();
    }
  });
}

// Add fadeIn animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
