mapboxgl.accessToken = process.env.MAPBOX_TOKEN;

// Initialise the map
setupMap([-3.7957, 53.1370]);

function setupMap(center) {
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: center,
        zoom: 8.5
    });

    const nav = new mapboxgl.NavigationControl();
    map.addControl(nav);

    const directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken
    });
    map.addControl(directions, 'top-left');

    // Canva image for logo
    const titleImage = document.createElement('img');
    titleImage.src = 'images/logo.jpeg';
    titleImage.alt = 'North Wales Trails';
    titleImage.style.position = 'fixed';
    titleImage.style.borderRadius = '10px';
    titleImage.style.transition = 'transform 0.2s ease';
    titleImage.style.zIndex = '1000';

    // Function to adjust image position and size based on screen width
    function updateTitlePosition() {
        if (window.innerWidth <= 768) { // Mobile breakpoint
            titleImage.style.left = '50%';
            titleImage.style.right = 'auto';
            titleImage.style.top = 'auto';
            titleImage.style.bottom = '10px';
            titleImage.style.transform = 'translateX(-50%)';
            titleImage.style.width = '150px'; // mobile
        } else {
            titleImage.style.left = '50%';
            titleImage.style.right = 'auto';
            titleImage.style.top = '15px';
            titleImage.style.bottom = 'auto';
            titleImage.style.transform = 'translateX(-50%)';
            titleImage.style.width = '225px'; // desktop
        }
    }

    // Initial position
    updateTitlePosition();

    // Update position on window resize
    window.addEventListener('resize', updateTitlePosition);

    // Hover effect for image (desktop only)
    titleImage.addEventListener('mouseenter', () => {
        if (window.innerWidth > 768) {
            titleImage.style.transform = 'translateX(-50%) scale(1.05)';
        }
    });
    titleImage.addEventListener('mouseleave', () => {
        if (window.innerWidth > 768) {
            titleImage.style.transform = 'translateX(-50%) scale(1)';
        } else {
            titleImage.style.transform = 'translateX(-50%)';
        }
    });

    // Append the image to the body
    document.body.appendChild(titleImage);

    // Fetch and display trails
    fetch('trails.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(trail => {
                const { name, coordinates, location, distance_m, time, type, difficulty, image } = trail;
                const markerElement = document.createElement('div');
                markerElement.innerHTML = `<img src="images/boot.svg" style="width: 40px; height: 40px; transition: transform 0.2s ease;">`;
                markerElement.style.cursor = 'pointer';
                const marker = new mapboxgl.Marker({ element: markerElement }).setLngLat(coordinates).addTo(map);
                const markerImg = markerElement.querySelector('img');
                markerElement.addEventListener('mouseenter', () => {
                    markerImg.style.transform = 'scale(1.2)';
                });
                markerElement.addEventListener('mouseleave', () => {
                    markerImg.style.transform = 'scale(1)';
                });

                const popupContent = `
                    <div class="trail-popup" style="max-width: 300px; background: #e8f5e9; padding: 15px; color: #2e7d32; border-radius: 8px; font-family: 'Montserrat', sans-serif; border: 1px solid #c8e6c9;">
                        <div style="position: relative;">
                            <img src="${image}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 10px;">
                            <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #1b5e20;">${name}</h3>
                            <div style="font-size: 14px;">
                                <p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>
                                <p style="margin: 5px 0;"><strong>Difficulty:</strong> ${difficulty}</p>
                                <p style="margin: 5px 0;"><strong>Type:</strong> ${type}</p>
                                <p style="margin: 5px 0;"><strong>Distance:</strong> ${distance_m}</p>
                                <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
                            </div>
                            <button id="lets-go-btn" style="position: absolute; bottom: 5px; right: 5px; background: #4caf50; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Let's Go!</button>
                        </div>
                    </div>
                `;

                markerElement.addEventListener('click', function (e) {
                    e.stopPropagation();
                    const existingPopup = document.querySelector('.custom-trail-popup');
                    if (existingPopup) existingPopup.remove();
                    const customPopup = document.createElement('div');
                    customPopup.className = 'custom-trail-popup';
                    customPopup.innerHTML = popupContent;
                    customPopup.style.position = 'fixed';
                    customPopup.style.zIndex = '9999';
                    customPopup.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'; 
                    customPopup.style.border = '1px solid #c8e6c9'; 
                    customPopup.style.transition = 'opacity 0.3s ease-out';
                    customPopup.style.opacity = '0';
                    const padding = 10;
                    customPopup.style.left = `${padding}px`;
                    customPopup.style.top = window.innerWidth <= 768 ? `${padding}px` : `${window.innerHeight - 350}px`;
                    customPopup.style.maxHeight = '300px';
                    customPopup.style.overflowY = 'auto';
                    const closeButton = document.createElement('button');
                    closeButton.innerText = 'X';
                    closeButton.style.position = 'absolute';
                    closeButton.style.top = '5px';
                    closeButton.style.right = '5px';
                    closeButton.style.background = '#4caf50'; // Matches the "Let's Go!" button
                    closeButton.style.color = 'white';
                    closeButton.style.border = 'none';
                    closeButton.style.padding = '3px 8px';
                    closeButton.style.borderRadius = '3px';
                    closeButton.style.cursor = 'pointer';
                    customPopup.appendChild(closeButton);
                    document.body.appendChild(customPopup);
                    setTimeout(() => {
                        customPopup.style.opacity = '1';
                    }, 10);
                    closeButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        customPopup.style.opacity = '0';
                        setTimeout(() => customPopup.remove(), 300);
                    });
                    const letsGoButton = customPopup.querySelector('#lets-go-btn');
                    letsGoButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                                (position) => {
                                    const userCoords = [position.coords.longitude, position.coords.latitude];
                                    directions.setOrigin(userCoords);
                                    directions.setDestination(coordinates);
                                    customPopup.style.opacity = '0';
                                    setTimeout(() => customPopup.remove(), 300);
                                },
                                (error) => {
                                    console.error('Error getting user location:', error);
                                    alert('Unable to get your location. Please allow location access or enter your starting point manually.');
                                }
                            );
                        } else {
                            alert('Geolocation is not supported by your browser.');
                        }
                    });
                });
            });
        })
        .catch(error => console.error('Error loading trail data:', error));
}