function createMarker(lat, lng, name, color, size) {
    size = size || "25px";
    var icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background-color:#${color}; width:${size}; height:${size}; border-radius:50%; border: 2px solid white;"></div>`,
        iconSize: [parseInt(size), parseInt(size)],
        iconAnchor: [parseInt(size) / 2, parseInt(size) / 2]
    });
    var marker = L.marker([lat, lng], { icon: icon });
    if (name) {
        marker.bindTooltip(name, { permanent: true, direction: 'right', className: 'sensor-tooltip' });
    }
    marker.options.sensorLat = lat;
    marker.options.sensorLng = lng;
    return marker;
}

$(document).ready(function () {
    var map = L.map('detailedMap').setView([47.54, 7.59], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    var airQualityMarkers = [
        createMarker(47.542621107, 7.58512577, "G107", "023E8A"),
        createMarker(47.542079622, 7.586808755, "G125", "0077B6"),
        createMarker(47.542283184, 7.586144668, "G131", "0096C7")
    ];

    var airQualityComparisonMarkers = [
        createMarker(47.567021, 7.594735, "Feldbergstrasse", "F48C06"),
        createMarker(47.565949, 7.582015, "St. Johanns-Platz", "FFBA08"),
        createMarker(47.538074, 7.648997, "A2 Hard", "DC2F02")
    ];

    var trafficNoiseMarkers = [
        createMarker(47.542738567, 7.584766135, "Traffic noise", "0000FF")
    ];

    var parkingSpotsMarkers = [
        createMarker(47.54286, 7.584762, null , "0000FF", "10px"),
        createMarker(47.543043, 7.584479, null , "0000FF", "10px"),
        createMarker(47.542872, 7.584714, null , "0000FF", "10px"),
        createMarker(47.542889, 7.58467, null , "0000FF", "10px"),
        createMarker(47.542932, 7.584533, null , "FFFF00", "10px"),
        createMarker(47.542916, 7.584576, null , "FFFF00", "10px")
    ];

    var evChargingMarkers = [
        createMarker(47.541764, 7.5880928, "Electric charging", "800000"),
        createMarker(47.54177, 7.5880887, "Electric charging", "400000"),
        createMarker(47.541766375, 7.588071298, "Electric charging", "FF0000")
    ];

    var categories = {
        airQuality: airQualityMarkers,
        airQualityComparison: airQualityComparisonMarkers,
        trafficNoise: trafficNoiseMarkers,
        parkingSpots: parkingSpotsMarkers,
        evCharging: evChargingMarkers
    };

    var displayedMarkers = [];

    function updateMarkers() {
        displayedMarkers.forEach(function(marker) {
            map.removeLayer(marker);
        });
        displayedMarkers = [];
        var allLatLngs = [];
        $('.category-checkbox').each(function() {
            var $checkbox = $(this);
            var category = $checkbox.val();
            if ($checkbox.is(':checked')) {
                var markers = categories[category];
                markers.forEach(function(marker) {
                    marker.addTo(map);
                    displayedMarkers.push(marker);
                    allLatLngs.push(marker.getLatLng());
                });
            }
        });
        if (allLatLngs.length > 0) {
            var bounds = L.latLngBounds(allLatLngs);
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }

    $('.category-checkbox').on('change', function() {
        updateMarkers();
    });

    updateMarkers();

    $('#sensorLegend .legend-item').on('click', function () {
        var lat = parseFloat($(this).data('lat'));
        var lng = parseFloat($(this).data('lng'));
        if (!isNaN(lat) && !isNaN(lng)) {
            map.setView([lat, lng], 18);
        }
    });

    $('.toggle-button').on('click', function(e) {
        e.stopPropagation();
        var $button = $(this);
        var $content = $button.closest('.category-block').find('.category-content');
        $content.slideToggle(200, function() {
            if ($content.is(':visible')) {
                $button.html('–');  
            } else {
                $button.html('+');  
            }
        });
    });

    $('.category-header').on('click', function(e) {
        if (!$(e.target).is('input, .toggle-button')) {
            $(this).find('.toggle-button').click();
        }
    });
});
