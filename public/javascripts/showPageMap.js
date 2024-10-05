mapboxgl.accessToken = '<%= process.env.MAPBOX_TOKEN %>';
const map = new mapboxgl.Map({
    container: 'map',  // The ID of the HTML element where the map will be rendered
    style: 'mapbox://styles/mapbox/light-v10',  // Mapbox style (you can try others like 'satellite')
    center: campground.geometry.coordinates,  // Coordinates from the campground data (longitude, latitude)
    zoom: 10  // You can adjust the zoom level if needed
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)  // Use the coordinates for the marker
    .setPopup(  // Add a popup to the marker
        new mapboxgl.Popup({ offset: 25 })  // Adjust the popup offset
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`  // Display the campground title and location
            )
    )
    .addTo(map);
