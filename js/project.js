// Set current year
document.getElementById('year').textContent = new Date().getFullYear();

// Theme system with improved toggle functionality
let currentTheme = 'dark'; // Default theme

function toggleTheme() {
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  
  if (currentTheme === 'dark') {
    body.classList.add('light-theme');
    themeToggle.checked = true;
    currentTheme = 'light';
  } else {
    body.classList.remove('light-theme');
    themeToggle.checked = false;
    currentTheme = 'dark';
  }
}

// Theme toggle event listener
document.getElementById('themeToggle').addEventListener('change', toggleTheme);

// Navigation functionality
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Remove active class from all links
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    // Add active class to clicked link
    this.classList.add('active');
    
    // Smooth scroll to section
    const targetId = this.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Contact form submission
document.querySelector('.contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;
  
  if (name && email && message) {
    alert('Thank you for your message! I will get back to you soon.');
    this.reset();
  }
});

// Updated Image Gallery App with GitHub buttons
const ImageGalleryApp = {
  // Updated gallery data with GitHub URLs
  galleryData: [
    {
      title: "Luna E-Wallet",
      category: ["UI/UX Design"], 
      description: "Designed a mobile e-wallet application with integrated expense tracking features. Created wireframes, high-fidelity UI designs, and interactive prototypes using Figma. Developed user flows based on user research and feedback to ensure optimal user experience.",
      images: [
        "img/projects/luna/luna.jpg",
        "img/projects/luna/Cards Dashboard.png",
        "img/projects/luna/Login Screen.png",
        "img/projects/luna/Expenses Tracker.png",
        "img/projects/luna/Screenshot 2025-08-24 203759.png",
      ],
      technologies: ["Figma", "Adobe Illustrator", "Prototyping"],
      year: "2024",
      githubUrl: null, // Design project, no GitHub
      liveUrl: null,
      pdfUrl: "pdfs/Luna_Case_Study.pdf" // Add your PDF file here
    },
    
    {
      title: "Mellowdy",
      category: ["UI/UX Design", "Software Development"],
      description: "An intuitive UI/UX design crafted for Mellowdy, a SoundLearning tool that enhances digital learning for Superior Smart Educator Academe of Carmona Inc. Developed a user-friendly UI for a preschool-targeted sound learning application using Figma and conducted functional and usability testing.",
      images: [
        "img/projects/mellowdy/melolog2.png",
        "img/projects/mellowdy/Custom Size – 1.png",
        "img/projects/mellowdy/Web 1366 – 1.png",
        "img/projects/mellowdy/Web 1366 – 2.png",
        "img/projects/mellowdy/Web 1366 – 3.png",
        "img/projects/mellowdy/Web 1366 – 4.png"
      ],
      technologies: ["Figma", "C#.net", "SQL", "Testing"],
      year: "2024",
      githubUrl: "https://github.com/madrian31/Mellowdy.git",
      liveUrl: null
    },

    {
      title: "Aurelia E-Wallet",
      category: ["UI/UX Design"],
      description: "A modern UI/UX design for E-Wallet application featuring contemporary design principles and user-centered approach. Focus on accessibility, usability, and visual appeal with seamless user interactions.",
      images: [
        "img/projects/Aurelia/Vector (3).png", 
        "img/projects/Aurelia/home.png", 
        "img/projects/Aurelia/lockscreen.png", 
        "img/projects/Aurelia/savings.png", 
        "img/projects/Aurelia/wallet.png", 
      ],
      technologies: ["Figma", "Design Systems", "User Research"],
      year: "2024",
      githubUrl: null, // Design project, no GitHub
      liveUrl: null
    },
    {
      title: "Attendo",
      category: ["Software Development"],
      description: "Attendo is a simple web-based attendance monitoring system developed using PHP and MySQL. It allows administrators to manage users, record attendance, and view attendance history in a clean dashboard interface. This project demonstrates basic CRUD operations, session management, and responsive design.",
      images: [
        "img/projects/Attendance/attendance Mockup.png",
        "img/projects/Attendance/Web View attendance.png",
        "img/projects/Attendance/mobile View attendance.png",
      ],
      technologies: ["PHP", "MySQL", "HTML", "CSS", "JavaScript"],
      year: "2024",
      githubUrl: "https://github.com/madrian31/Attendo.git",
      liveUrl: null
    },
    {
      title: "Student Research Center",
      category: ["Networks"],
      description: "Comprehensive network infrastructure project involving installation and configuration of computers and networking hardware for a student research facility. Designed and implemented LAN setup across multiple rooms and buildings to ensure stable connectivity, security, and scalability.",
      images: [
        "img/projects/StudentCenter/src.jpg", 
        "img/projects/StudentCenter/src1.png", 
        "img/projects/StudentCenter/src2.png", 
        "img/projects/StudentCenter/src3.jpg", 
        "img/projects/StudentCenter/src topo.jpg", 
      ],
      technologies: ["Cisco", "Network Topology", "LAN Setup", "Hardware Configuration"],
      year: "2024",
      githubUrl: "", 
      liveUrl: null
    },
    {
      title: "Invictus",
      category: ["Logo Design"],
      description: "A powerful and bold logo design for Invictus brand, embodying strength, victory, and resilience. Created with modern design principles and strong visual impact.",
      images: [
         "img/projects/invictus.png", 
      ],
      technologies: ["Adobe Illustrator", "Branding", "Logo Design"],
      year: "2024",
      githubUrl: null, // Design project, no GitHub
      liveUrl: null
    },
    {
      title: "Hiraya",
      category: ["Logo Design"],
      description: "An elegant and meaningful logo design for Hiraya, representing dreams, aspirations, and Filipino heritage. Crafted with cultural significance and modern aesthetics.",
      images: [
        "img/projects/Hiraya/HirayaLogo.png"
      ],
      technologies: ["Adobe Illustrator", "Branding", "Logo Design"],
      year: "2024",
      githubUrl: null, // Design project, no GitHub
      liveUrl: null
    },
    {
      title: "Lunarity",
      category: ["Logo Design"],
      description: "Lunarity is a logo crafted for a Facebook page dedicated to spreading positivity through inspirational and motivational quotes. Its design reflects hope, growth, and encouragement.",
      images: [
        "img/projects/Lunarity/Asset 6.png",
        "img/projects/Lunarity/Asset 1.png",
        "img/projects/Lunarity/Asset 4.png",
        "img/projects/Lunarity/Asset 5.png",
        "img/projects/Lunarity/Asset 7.png",
      ],
      technologies: ["Adobe Illustrator", "Branding", "Logo Design"],
      year: "2024",
      githubUrl: null, // Design project, no GitHub
      liveUrl: null
    },

    {
      title: "Minimalist Branding with QR Integration",
      category: ["Graphic Design"],
      description: "A sleek and professional business card mockup showcasing a bold geometric logo and a functional QR code for instant digital access. The minimalist grayscale palette conveys sophistication, while the textured background adds depth and a modern aesthetic.",
      images: [
        "img/projects/BusinessCard/BusinessCard.png",
        "img/projects/BusinessCard/PaperAndBusinessCardMockupWithPaperClip.png",
        "img/projects/BusinessCard/StylishBusinessCard.png",
        "img/projects/BusinessCard/RealisticBusinessCard.png",
        "img/projects/BusinessCard/Artboard1.png",
        "img/projects/BusinessCard/Artboard1copy.png",
      ],
      technologies: ["Adobe Illustrator","Adobe Photoshop", "Branding", "Logo Design"],
      year: "2025",
      githubUrl: null, // Design project, no GitHub
      liveUrl: null
    },

    {
      title: "Financial Strategy — Business & Income Department",
      category: ["Business Strategy", "Documentation"],
      description: "Comprehensive financial strategy and operational framework for establishing a sustainable income department. Includes organizational structure, capital formation, budget allocation, burn rate analysis, income strategies, and performance metrics. Developed with detailed planning for Charter Members, team allowances, and risk management.",
      images: [],
      technologies: ["Financial Planning", "Business Strategy", "Organizational Development", "Risk Management"],
      year: "2026",
      githubUrl: null,
      liveUrl: null,
      pdfUrl: "pdfs/Financial-Strategy-Business-Income-Department.pdf"
    }
    
  ],

  // Application state
  currentGalleryIndex: 0,
  currentImageIndex: 0,
  isInitialized: false,

  // DOM Elements cache
  elements: {},

  // Main initialization method
  init() {
    if (this.isInitialized) {
      console.warn('ImageGalleryApp already initialized');
      return;
    }
    
    try {
      this.cacheElements();
      this.generateFilters();
      this.generateGallery();
      this.bindEvents();
      this.isInitialized = true;
      
      console.log('ImageGalleryApp initialized successfully with', this.galleryData.length, 'items');
    } catch (error) {
      console.error('Failed to initialize ImageGalleryApp:', error);
    }
  },

  // Cache DOM elements for performance
  cacheElements() {
    this.elements = {
      categoryFilters: document.getElementById("imgGalleryFilters"),
      gallery: document.getElementById("imgGalleryGrid"),
      modal: document.getElementById("imgGalleryModal"),
      modalTitle: document.getElementById("imgGalleryModalTitle"),
      modalDescription: document.getElementById("imgGalleryModalDescription"),
      carouselImage: document.getElementById("imgGalleryCarouselImage"),
      carouselDots: document.getElementById("imgGalleryCarouselDots"),
      pdfContainer: document.getElementById("imgGalleryPdfContainer"),
      pdfViewer: document.getElementById("imgGalleryPdfViewer"),
      modalFooter: document.getElementById("imgGalleryModalFooter"),
      closeBtn: document.querySelector(".img-gallery-close"),
      imageCounter: document.getElementById('imgGalleryImageCounter')
    };

    // Validate required elements
    const requiredElements = ['gallery'];
    const missingElements = requiredElements.filter(key => !this.elements[key]);
    
    if (missingElements.length > 0) {
      console.warn('Missing required elements:', missingElements);
    }
  },

  // Get all unique categories
  getAllCategories() {
    const categories = new Set();
    
    this.galleryData.forEach(item => {
      if (Array.isArray(item.category)) {
        item.category.forEach(cat => categories.add(cat));
      } else {
        categories.add(item.category);
      }
    });
    
    return [...categories].sort();
  },

  // Generate category filter buttons
  generateFilters() {
    if (!this.elements.categoryFilters) {
      console.warn('Category filters container not found');
      return;
    }
    
    const categories = this.getAllCategories();
    
    // Setup "All" button if it exists
    const allButton = this.elements.categoryFilters.querySelector('[data-category="all"]');
    if (allButton) {
      allButton.addEventListener("click", () => this.filterGallery("all"));
      allButton.classList.add("img-gallery-active");
    }
    
    // Generate category buttons
    categories.forEach(category => {
      // Skip if button already exists
      if (this.elements.categoryFilters.querySelector(`[data-category="${category}"]`)) {
        return;
      }
      
      const button = document.createElement("button");
      button.className = "img-gallery-filter-btn";
      button.dataset.category = category;
      
      // Category icons mapping
      const icons = {
        'UI/UX Design': 'bi-palette',
        'Web Development': 'bi-code-slash',
        'Software Development': 'bi-laptop',
        'Logo Design': 'bi-pentagon',
        'Networks': 'bi-router',
        'Branding': 'bi-award'
      };
      
      const icon = icons[category] || 'bi-folder';
      button.innerHTML = `<i class="bi ${icon}" style="margin-right: 5px;"></i>${category}`;
      button.addEventListener("click", () => this.filterGallery(category));
      this.elements.categoryFilters.appendChild(button);
    });
  },

  // Generate gallery grid items
  generateGallery() {
    if (!this.elements.gallery) {
      console.error('Gallery container not found');
      return;
    }
    
    this.elements.gallery.innerHTML = "";
    
    if (this.galleryData.length === 0) {
      this.elements.gallery.innerHTML = '<p class="no-items">No projects found.</p>';
      return;
    }
    
    this.galleryData.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "img-gallery-item";
      
      // Handle multiple categories for data attributes
      if (Array.isArray(item.category)) {
        div.dataset.category = item.category[0];
        div.dataset.categories = item.category.join(',');
      } else {
        div.dataset.category = item.category;
        div.dataset.categories = item.category;
      }
      
      div.addEventListener("click", () => this.openModal(index));

      // Create image or placeholder
      if (item.images && item.images.length > 0) {
        const img = document.createElement("img");
        img.src = item.images[0];
        img.alt = item.title;
        img.loading = "lazy";
        div.appendChild(img);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "img-gallery-placeholder";
        const icon = item.pdfUrl ? "bi-file-earmark-pdf" : "bi-file-earmark-text";
        placeholder.innerHTML = `<i class="bi ${icon}"></i><span>Documentation</span>`;
        div.appendChild(placeholder);
      }

      // Create overlay
      const overlay = document.createElement("div");
      overlay.className = "img-gallery-overlay";
      
      // Project title
      const title = document.createElement("h3");
      title.textContent = item.title;
      
      // Categories display
      const category = document.createElement("p");
      if (Array.isArray(item.category)) {
        category.textContent = item.category.join(' • ');
      } else {
        category.textContent = item.category;
      }
      
      // GitHub button (only if githubUrl exists)
      if (item.githubUrl) {
        const githubBtn = document.createElement("a");
        githubBtn.href = item.githubUrl;
        githubBtn.target = "_blank";
        githubBtn.rel = "noopener noreferrer";
        githubBtn.className = "github-btn";
        githubBtn.innerHTML = `<i class="bi bi-github"></i>View Code`;
        githubBtn.onclick = (e) => e.stopPropagation(); // Prevent modal from opening when clicking GitHub button
        
        overlay.appendChild(title);
        overlay.appendChild(category);
        overlay.appendChild(githubBtn);
      } else {
        overlay.appendChild(title);
        overlay.appendChild(category);
      }
      
      div.appendChild(overlay);

      this.elements.gallery.appendChild(div);
    });
  },

  // Filter gallery by category
  filterGallery(category) {
    this.elements.categoryFilters?.querySelectorAll(".img-gallery-filter-btn").forEach(btn => {
      btn.classList.remove("img-gallery-active");
    });
    
    const activeBtn = this.elements.categoryFilters?.querySelector(`[data-category="${category}"]`);
    if (activeBtn) {
      activeBtn.classList.add("img-gallery-active");
    }
    
    const items = this.elements.gallery.querySelectorAll(".img-gallery-item");
    
    items.forEach((item) => {
      const itemCategories = item.dataset.categories ? 
        item.dataset.categories.split(',').map(cat => cat.trim()) : 
        [item.dataset.category];
      
      const shouldShow = category === "all" || itemCategories.includes(category);
      
      if (shouldShow) {
        item.classList.remove("img-gallery-hidden");
      } else {
        item.classList.add("img-gallery-hidden");
      }
    });
  },

  // Open modal with project details
  openModal(galleryIndex) {
    this.currentGalleryIndex = galleryIndex;
    this.currentImageIndex = 0;
    
    const item = this.galleryData[galleryIndex];
    
    if (!item) {
      console.error('Project not found at index:', galleryIndex);
      return;
    }
    
    if (this.elements.modalTitle) {
      this.elements.modalTitle.textContent = item.title;
    }
    
    if (this.elements.modalDescription) {
      let descriptionHTML = `<p class="modal-desc-text">${item.description}</p>`;

      if (item.technologies && item.technologies.length > 0) {
        descriptionHTML += `
          <div class="modal-section">
            <span class="modal-section-label"><i class="bi bi-code-slash"></i> Technologies</span>
            <div class="modal-tech-tags">
              ${item.technologies.map(tech => `<span class="modal-tech-tag">${tech}</span>`).join('')}
            </div>
          </div>`;
      }

      if (item.year) {
        descriptionHTML += `
          <div class="modal-section">
            <span class="modal-section-label"><i class="bi bi-calendar3"></i> Year</span>
            <span class="modal-year-badge">${item.year}</span>
          </div>`;
      }

      if (item.githubUrl) {
        descriptionHTML += `
          <a href="${item.githubUrl}" target="_blank" rel="noopener noreferrer" class="modal-github-btn">
            <i class="bi bi-github"></i>View on GitHub
          </a>`;
      }

      if (item.pdfUrl) {
        descriptionHTML += `
          <a href="${item.pdfUrl}" target="_blank" rel="noopener noreferrer" class="modal-pdf-btn">
            <i class="bi bi-file-pdf"></i>Download Documentation
          </a>`;
      }

      this.elements.modalDescription.innerHTML = descriptionHTML;
    }

    // Mark modal-content for CSS targeting (doc-only vs image project)
    const modalContent = this.elements.modal?.querySelector('.img-gallery-modal-content');
    if (modalContent) {
      if (!item.images || item.images.length === 0) {
        modalContent.classList.add('img-gallery-modal-doc-only');
      } else {
        modalContent.classList.remove('img-gallery-modal-doc-only');
      }
    }

    // Footer: always hidden — inline PDF btn in description handles mobile download
    if (this.elements.modalFooter) {
      this.elements.modalFooter.style.display = 'none';
    }

    this.setupCarousel(item.images);
    
    if (this.elements.modal) {
      this.elements.modal.style.display = "block";
      document.body.style.overflow = "hidden";
      
      setTimeout(() => {
        this.elements.modal.classList.add("img-gallery-modal-open");
      }, 10);
    }
  },

  // Setup image carousel in modal
  setupCarousel(images) {
    const carouselContainer = document.querySelector('.img-gallery-carousel-container');
    const item = this.galleryData[this.currentGalleryIndex];

    // Reset PDF viewer state
    if (this.elements.pdfContainer) {
      this.elements.pdfContainer.style.display = 'none';
    }
    if (this.elements.pdfViewer) {
      this.elements.pdfViewer.src = '';
    }

    if (!images || images.length === 0) {
      if (carouselContainer) {
        carouselContainer.style.display = 'none';
      }
      if (this.elements.carouselDots) {
        this.elements.carouselDots.style.display = 'none';
      }
      if (this.elements.imageCounter) {
        this.elements.imageCounter.classList.remove('visible');
      }
      // Show PDF viewer if available
      if (item && item.pdfUrl && this.elements.pdfContainer && this.elements.pdfViewer) {
        this.elements.pdfViewer.src = item.pdfUrl;
        this.elements.pdfContainer.style.display = 'flex';
      }
      return;
    }

    // Restore carousel and dots
    if (carouselContainer) {
      carouselContainer.style.display = 'flex';
    }
    if (this.elements.carouselDots) {
      this.elements.carouselDots.style.display = 'flex';
    }

    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const hasMultiple = images.length > 1;
    if (prevBtn) prevBtn.style.display = hasMultiple ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = hasMultiple ? 'flex' : 'none';
    
    if (this.elements.carouselDots) {
      this.elements.carouselDots.innerHTML = "";
      
      if (images.length > 1) {
        images.forEach((_, index) => {
          const dot = document.createElement("span");
          dot.className = "img-gallery-dot";
          if (index === 0) dot.classList.add("img-gallery-active");
          dot.addEventListener("click", () => this.showImage(index));
          this.elements.carouselDots.appendChild(dot);
        });
      }
    }
    
    this.showImage(0);
  },

  // Show specific image in carousel
  showImage(imageIndex) {
    const item = this.galleryData[this.currentGalleryIndex];
    
    if (!item || !item.images || imageIndex < 0 || imageIndex >= item.images.length) {
      console.error('Invalid image index or missing images');
      return;
    }
    
    this.currentImageIndex = imageIndex;
    
    if (this.elements.carouselImage) {
      this.elements.carouselImage.style.opacity = "0.5";
      
      this.elements.carouselImage.onload = () => {
        this.elements.carouselImage.style.opacity = "1";
      };
      
      this.elements.carouselImage.src = item.images[imageIndex];
      this.elements.carouselImage.alt = `${item.title} - Image ${imageIndex + 1}`;
    }
    
    if (this.elements.carouselDots) {
      this.elements.carouselDots.querySelectorAll(".img-gallery-dot").forEach((dot, index) => {
        dot.classList.toggle("img-gallery-active", index === imageIndex);
      });
    }

    if (this.elements.imageCounter) {
      const total = item.images.length;
      if (total > 1) {
        this.elements.imageCounter.textContent = `${imageIndex + 1} / ${total}`;
        this.elements.imageCounter.classList.add('visible');
      } else {
        this.elements.imageCounter.classList.remove('visible');
      }
    }
  },

  // Navigate to previous image
  previousImage() {
    const item = this.galleryData[this.currentGalleryIndex];
    
    if (!item || !item.images) return;
    
    const totalImages = item.images.length;
    const prevIndex = (this.currentImageIndex - 1 + totalImages) % totalImages;
    this.showImage(prevIndex);
  },

  // Navigate to next image
  nextImage() {
    const item = this.galleryData[this.currentGalleryIndex];
    
    if (!item || !item.images) return;
    
    const totalImages = item.images.length;
    const nextIndex = (this.currentImageIndex + 1) % totalImages;
    this.showImage(nextIndex);
  },

  // Close modal
  closeModal() {
    if (this.elements.modal) {
      this.elements.modal.classList.remove("img-gallery-modal-open");
      
      setTimeout(() => {
        this.elements.modal.style.display = "none";
        document.body.style.overflow = "auto";
      }, 300);
    }
  },

  // Bind all event listeners
  bindEvents() {
    // Modal close button
    if (this.elements.closeBtn) {
      this.elements.closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.closeModal();
      });
    }

    // Carousel arrow buttons
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); this.previousImage(); });
    if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); this.nextImage(); });

    // Click outside modal to close
    if (this.elements.modal) {
      this.elements.modal.addEventListener("click", (event) => {
        if (event.target === this.elements.modal) {
          this.closeModal();
        }
      });
    }

    // Touch swipe for carousel
    const carouselContainer = document.querySelector('.img-gallery-carousel-container');
    if (carouselContainer) {
      let touchStartX = 0;
      let touchStartY = 0;

      carouselContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      carouselContainer.addEventListener('touchend', (e) => {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
          deltaX < 0 ? this.nextImage() : this.previousImage();
        }
      }, { passive: true });
    }

    // Keyboard navigation
    document.addEventListener("keydown", (event) => {
      if (this.elements.modal && this.elements.modal.style.display === "block") {
        event.preventDefault();
        
        switch(event.key) {
          case "Escape":
            this.closeModal();
            break;
          case "ArrowLeft":
            this.previousImage();
            break;
          case "ArrowRight":
            this.nextImage();
            break;
        }
      }
    });
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize gallery
  ImageGalleryApp.init();
  console.log('Gallery initialized successfully!');
});
