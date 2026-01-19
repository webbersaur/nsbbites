// NSB Bites - Restaurant Data & Filtering

let restaurantsData = [];
let filteredRestaurants = [];

// Feature display names
const featureNames = {
    'waterfront': 'Waterfront',
    'outdoor-seating': 'Outdoor Seating',
    'family-friendly': 'Family Friendly',
    'live-music': 'Live Music',
    'bar': 'Full Bar',
    'brunch': 'Brunch',
    'craft-cocktails': 'Craft Cocktails',
    'quick-service': 'Quick Service',
    'fine-dining': 'Fine Dining',
    'historic': 'Historic',
    'wine-bar': 'Wine Bar',
    'date-night': 'Date Night',
    'breakfast': 'Breakfast',
    'craft-beer': 'Craft Beer',
    'coffee': 'Coffee',
    'wifi': 'Free WiFi'
};

// Initialize restaurant data
async function initRestaurants() {
    try {
        const response = await fetch('data/restaurants.json');
        const data = await response.json();
        restaurantsData = data.restaurants;
        filteredRestaurants = [...restaurantsData];
        renderRestaurants(filteredRestaurants);
        updateResultsCount(filteredRestaurants.length);
    } catch (error) {
        console.error('Error loading restaurant data:', error);
        document.getElementById('restaurant-grid').innerHTML =
            '<div class="no-results"><h3>Unable to load restaurants</h3><p>Please try again later.</p></div>';
    }
}

// Render restaurant cards
function renderRestaurants(restaurants) {
    const grid = document.getElementById('restaurant-grid');

    if (!grid) return;

    if (restaurants.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <h3>No restaurants found</h3>
                <p>Try adjusting your search or filters.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = restaurants.map(restaurant => createRestaurantCard(restaurant)).join('');
}

// Create a single restaurant card HTML
function createRestaurantCard(restaurant) {
    const featuresHtml = restaurant.features
        .map(feature => `<span class="feature-tag">${featureNames[feature] || feature}</span>`)
        .join('');

    // Use placeholder image or actual image
    const imageStyle = `background-image: url('images/restaurants/${restaurant.image}'), url('https://via.placeholder.com/400x200/1E5AA8/FFFFFF?text=${encodeURIComponent(restaurant.name)}')`;

    return `
        <div class="restaurant-card" data-cuisine="${restaurant.cuisine.toLowerCase()}" data-price="${restaurant.priceRange}">
            <div class="restaurant-card-image" style="${imageStyle}">
                <span class="price-tag">${restaurant.priceRange}</span>
            </div>
            <div class="restaurant-card-content">
                <h3>${restaurant.name}</h3>
                <p class="restaurant-cuisine">${restaurant.cuisine}</p>
                <p>${restaurant.description}</p>
                <div class="restaurant-address">
                    <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    <span>${restaurant.address}</span>
                </div>
                <div class="restaurant-features">
                    ${featuresHtml}
                </div>
                <div class="restaurant-links">
                    <a href="${restaurant.mapLink}" target="_blank" rel="noopener">Directions</a>
                    ${restaurant.website !== '#' ? `<a href="${restaurant.website}" target="_blank" rel="noopener">Website</a>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Filter restaurants based on search and filters
function filterRestaurants() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const cuisineFilter = document.getElementById('cuisine-filter')?.value || 'all';
    const priceFilter = document.getElementById('price-filter')?.value || 'all';
    const featureFilter = document.getElementById('feature-filter')?.value || 'all';

    filteredRestaurants = restaurantsData.filter(restaurant => {
        // Search filter
        const matchesSearch = searchTerm === '' ||
            restaurant.name.toLowerCase().includes(searchTerm) ||
            restaurant.cuisine.toLowerCase().includes(searchTerm) ||
            restaurant.description.toLowerCase().includes(searchTerm);

        // Cuisine filter
        const matchesCuisine = cuisineFilter === 'all' ||
            restaurant.cuisine.toLowerCase() === cuisineFilter.toLowerCase();

        // Price filter
        const matchesPrice = priceFilter === 'all' ||
            restaurant.priceRange === priceFilter;

        // Feature filter
        const matchesFeature = featureFilter === 'all' ||
            restaurant.features.includes(featureFilter);

        return matchesSearch && matchesCuisine && matchesPrice && matchesFeature;
    });

    renderRestaurants(filteredRestaurants);
    updateResultsCount(filteredRestaurants.length);
}

// Update results count display
function updateResultsCount(count) {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = `Showing ${count} restaurant${count !== 1 ? 's' : ''}`;
    }
}

// Clear all filters
function clearFilters() {
    const searchInput = document.getElementById('search-input');
    const cuisineFilter = document.getElementById('cuisine-filter');
    const priceFilter = document.getElementById('price-filter');
    const featureFilter = document.getElementById('feature-filter');

    if (searchInput) searchInput.value = '';
    if (cuisineFilter) cuisineFilter.value = 'all';
    if (priceFilter) priceFilter.value = 'all';
    if (featureFilter) featureFilter.value = 'all';

    filteredRestaurants = [...restaurantsData];
    renderRestaurants(filteredRestaurants);
    updateResultsCount(filteredRestaurants.length);
}

// Event listeners for filters
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const cuisineFilter = document.getElementById('cuisine-filter');
    const priceFilter = document.getElementById('price-filter');
    const featureFilter = document.getElementById('feature-filter');
    const clearBtn = document.getElementById('clear-filters');

    // Add event listeners if elements exist
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterRestaurants, 300));
    }
    if (cuisineFilter) {
        cuisineFilter.addEventListener('change', filterRestaurants);
    }
    if (priceFilter) {
        priceFilter.addEventListener('change', filterRestaurants);
    }
    if (featureFilter) {
        featureFilter.addEventListener('change', filterRestaurants);
    }
    if (clearBtn) {
        clearBtn.addEventListener('click', clearFilters);
    }

    // Initialize if on dining guide page
    if (document.getElementById('restaurant-grid')) {
        initRestaurants();
    }
});

// Debounce helper function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Get featured restaurants for homepage
function getFeaturedRestaurants(count = 4) {
    return restaurantsData.slice(0, count);
}

// Load featured restaurants on homepage
async function loadFeaturedRestaurants() {
    try {
        const response = await fetch('data/restaurants.json');
        const data = await response.json();
        const featured = data.restaurants.slice(0, 4);

        const grid = document.getElementById('featured-restaurants-grid');
        if (grid) {
            grid.innerHTML = featured.map(restaurant => createRestaurantCard(restaurant)).join('');
        }
    } catch (error) {
        console.error('Error loading featured restaurants:', error);
    }
}

// Initialize featured restaurants if on homepage
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('featured-restaurants-grid')) {
        loadFeaturedRestaurants();
    }
});
