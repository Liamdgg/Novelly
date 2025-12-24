// Initialize Swiper carousel
function initSwiper(containerId, slides) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Build swiper HTML
    container.innerHTML = `
        <div class="swiper">
            <div class="swiper-wrapper">
                ${slides.map(novel => createSwiperSlide(novel)).join('')}
            </div>
            
            <!-- Navigation arrows -->
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
            
            <!-- Pagination dots -->
            <div class="swiper-pagination"></div>
        </div>
    `;
    
    // Initialize Swiper.js library
    const swiper = new Swiper(`#${containerId} .swiper`, {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
            },
            768: {
                slidesPerView: 3,
            },
            1024: {
                slidesPerView: 4,
            },
            1280: {
                slidesPerView: 5,
            }
        }
    });
    
    return swiper;
}



