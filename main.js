mapboxgl.accessToken = 'pk.eyJ1IjoiZGF1ZGk5NyIsImEiOiJjanJtY3B1bjYwZ3F2NGFvOXZ1a29iMmp6In0.9ZdvuGInodgDk7cv-KlujA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    zoom: 3,
    center: [18.712687550244368, 42.24007402814564]
});

var apiUrl = "https://www.fullylinked.com/api/getStatistics/";
var dummyGeojson = {
    "type": "FeatureCollection",
    "features": []
};

var allData;
map.on("load", function(e) {
    // create a data
    map.addSource('people', {
        'type':'geojson',
        'data':dummyGeojson
    });

    map.addLayer({
        'id':'people-layer',
        'source':'people',
        'type':'circle',
        'paint':{
            'circle-radius':[
                'interpolate',
                ['linear'],
                ['get', 'total'],
                1,
                3,
                100,
                100
            ],
            'circle-color':'#f45050',
            'circle-opacity':0.7,
            'circle-stroke-width':1,
            'circle-stroke-color':'#f44646'
        },
        'layout':{
            'visibility':'visible'
        }
    });

    // f44646
    map.on("mouseenter",'people-layer', function(e){
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on("mouseleave", "people-layer", function(e) {
        map.getCanvas().style.cursor = '';
    });

    // layer interaction
    map.on("click", 'people-layer', function(e) {
        let features = map.queryRenderedFeatures(e.point,{
            layer:['peopple-layer']
        });

        if(features[0]) {
            let feature = features[0];

            let htmlContent = "<div class='popup-content'>" + 
                "<h5 class='popup-header'>" + feature.properties.name + "</h5>"+
                "<p> Total " + feature.properties.total + "</p>"+
             "</div>"

            // create popup
            new mapboxgl.Popup()
                .setLngLat(feature.geometry.coordinates)
                .setHTML(htmlContent)
                .setMaxWidth("250")
                .addTo(map);
        }
    });
    // load data
    getData(1);
});


function getData(index) {
    let url = apiUrl + index;
    fetch('points.json' ,{
        mode: 'no-cors',
    })
    .then(response => response.json())
    .then(data => {
        let geojson = createGeojson(data);
        map.getSource('people').setData(geojson);
    })
    .catch(error => {
        console.error(error);
    });
}


function createGeojson(data) {
    let geoObj = JSON.parse(JSON.stringify(dummyGeojson));

    for (let i = 0; i < data.length; i++) {
        const element = data[i];

        element.total = Math.floor(Math.random() * 20);
        let feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates":[
                    parseFloat(element.longitude),
                    parseFloat(element.latitude)
                ]
            },
            "properties":element
        }
        
        geoObj.features.push(feature);
    }

    console.log(geoObj);
    return geoObj;
}