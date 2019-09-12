if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.leaflet_map = function(form) {

    var _map = this;

    if (_map.attr('id') == null) {
        return false;
    }

    m(document.body).load_script('https://unpkg.com/leaflet@1.4.0/dist/leaflet.js', function(){

        if (typeof L === 'undefined') {
            return false;
        }

        var
            address = _map.data.address || '',
            access_token = _map.data.access_token || '',
            lat = parseFloat(_map.data.lat),
            lon = parseFloat(_map.data.lon),
            z = parseFloat(_map.data.z) || 18,
            map = L.map(_map.attr('id')).setView([lat, lon], z),
            marker = new L.marker([lat, lon], {draggable:'false'}),
            map_addr = [],
            addr_collect_processing = false,
            init_geocode = function(){
                map_addr = [];

                if (addr_collect_processing) {
                    return true;
                }

                m.ajax({
                    data: {
                        address: address,
                        action: '_ajax_geocode'
                    },
                    success: function(response){

                        addr_collect_processing = false;

                        if (typeof response.lat !== 'undefined' && typeof response.lon !== 'undefined' && parseFloat(response.lat) > 0 && parseFloat(response.lon) > 0) {
                            marker.setLatLng([parseFloat(response.lat), parseFloat(response.lon)],{draggable:'true'});
                            map.flyTo([parseFloat(response.lat), parseFloat(response.lon)], z);
                        }
                    }
                });
            };

        if ((lat == 0 || lon == 0) && address.length > 0) {
            init_geocode();
        }

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + access_token, {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ',
            id: 'mapbox.streets'
        }).addTo(map);

        marker.addTo(map);
    });
};