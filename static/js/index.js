window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();

})

// Adaptive scrolling animation
document.addEventListener('DOMContentLoaded', function() {
  const scrollingContainer = document.querySelector('.scrolling-container');
  const scrollingImages = document.querySelector('.scrolling-images');
  
  if (scrollingImages && scrollingContainer) {
    console.log('Found scrolling elements'); // Debug log
    
    function calculateAndSetDuration() {
      // Calculate total width of first set of images (before duplicates)
      const images = scrollingImages.querySelectorAll('img');
      const totalImages = images.length / 2; // We have duplicates
      let totalWidth = 0;
      
      for (let i = 0; i < totalImages; i++) {
        const img = images[i];
        if (img.offsetWidth > 0) {
          totalWidth += img.offsetWidth + 40; // 40px margin-right
        } else {
          totalWidth += 150; // Fallback width per image
        }
      }
      
      // Scroll speed in pixels per second (lower = slower, higher = faster)
      const scrollSpeed = 50; // Adjust this value to control speed
      const duration = totalWidth / scrollSpeed;
      
      console.log('Total width:', totalWidth, 'Duration:', duration); // Debug log
      
      // Set the duration
      scrollingContainer.style.setProperty('--scroll-duration', duration + 's');
    }
    
    // Try calculating immediately
    setTimeout(calculateAndSetDuration, 100);
    
    // Also try after images load
    setTimeout(calculateAndSetDuration, 1000);
  } else {
    console.log('Scrolling elements not found'); // Debug log
  }
});

// Table Gallery functionality with dynamic loading
document.addEventListener('DOMContentLoaded', function() {
  const tabButtons = document.querySelectorAll('.table-gallery-nav .tabs li');
  const tableContainer = document.querySelector('.table-gallery-content');
  
  if (!tableContainer) return;
  
  // Cache for loaded tables
  const tableCache = {};
  
  // Table file mappings
  const tableFiles = {
    'main-results': './static/tables/main-results.html',
    'no-background-music': './static/tables/no-background-music.html',
    'no-voice-over': './static/tables/no-voice-over.html',
    'no-static-image': './static/tables/no-static-image.html'
  };
  
  // Load table content
  async function loadTable(tableId) {
    if (tableCache[tableId]) {
      return tableCache[tableId];
    }
    
    const filePath = tableFiles[tableId];
    if (!filePath) {
      console.error('Table file not found for:', tableId);
      return '<p>Table not found</p>';
    }
    
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const content = await response.text();
      tableCache[tableId] = content;
      return content;
    } catch (error) {
      console.error('Error loading table:', error);
      return '<p>Error loading table content</p>';
    }
  }
  
  // Show loading state
  function showLoading() {
    tableContainer.innerHTML = '<div class="has-text-centered" style="padding: 2rem;"><span class="icon is-large"><i class="fas fa-spinner fa-spin"></i></span><br>Loading...</div>';
  }
  
  // Initialize with main results table
  loadTable('main-results').then(content => {
    tableContainer.innerHTML = content;
  });

  tabButtons.forEach(button => {
    button.addEventListener('click', async function(e) {
      e.preventDefault();
      
      const targetTable = this.getAttribute('data-table');
      
      // Remove active class from all tabs
      tabButtons.forEach(btn => btn.classList.remove('is-active'));
      
      // Add active class to clicked tab
      this.classList.add('is-active');
      
      // Show loading state
      showLoading();
      
      // Load and display table content
      const content = await loadTable(targetTable);
      tableContainer.innerHTML = content;
    });
  });
  
  // Set first tab as active by default
  if (tabButtons.length > 0) {
    tabButtons[0].classList.add('is-active');
  }
});

// Boar emoji audio functionality
document.addEventListener('DOMContentLoaded', function() {
  const boarEmoji = document.getElementById('boar-emoji');
  let boarAudio = null;
  
  // Preload the audio
  try {
    boarAudio = new Audio('./static/audio/Boar by rvinyard.mp3');
    boarAudio.preload = 'auto';
    boarAudio.volume = 0.5; // Set volume to 50%
  } catch (error) {
    console.log('Audio not available:', error);
  }
  
  if (boarEmoji && boarAudio) {
    // Add hover event listeners
    boarEmoji.addEventListener('mouseenter', function() {
      // Reset audio to beginning and play
      try {
        boarAudio.currentTime = 0;
        boarAudio.play().catch(e => {
          console.log('Audio play failed:', e);
        });
      } catch (error) {
        console.log('Audio play error:', error);
      }
    });
    
    // Optional: Add click event for mobile devices
    boarEmoji.addEventListener('click', function() {
      try {
        boarAudio.currentTime = 0;
        boarAudio.play().catch(e => {
          console.log('Audio play failed:', e);
        });
      } catch (error) {
        console.log('Audio play error:', error);
      }
    });
  }
});
