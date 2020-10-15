mapboxgl.accessToken = 'pk.eyJ1IjoiZGF1ZGk5NyIsImEiOiJjanJtY3B1bjYwZ3F2NGFvOXZ1a29iMmp6In0.9ZdvuGInodgDk7cv-KlujA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    zoom: 1.4,
    center: [9.96420545488088, 25.499103553541858]
});

var apiUrl = "https://www.fullylinked.com/api/getStatistics/";
var dummyGeojson = {
    "type": "FeatureCollection",
    "features": []
};

var allData;

// wait for map to load to add data sources, interactivity etc
map.on("load", function(e) {
    // create people data source
    map.addSource('people', {
        'type':'geojson',
        'data':dummyGeojson
    });

    // add a data layer for people data source
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

    // change the cursor
    map.on("mouseenter",'people-layer', function(e){
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on("mouseleave", "people-layer", function(e) {
        map.getCanvas().style.cursor = '';
    });

    // layer interaction: display popup on click
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

            // create popup and add it to the map
            new mapboxgl.Popup()
                .setLngLat(feature.geometry.coordinates)
                .setHTML(htmlContent)
                .setMaxWidth("250")
                .addTo(map);
        }
    });

    // load data with the given index
    getData(1);
});

// Extract the data from the api
function getData(index) {
    let url = apiUrl + index;
    fetch(url ,{
        mode: 'cors',
    })
    .then(response => response.json())
    .then(data => {
        // convert the json to geojson
        let geojson = createGeojson(data);

        // update the people data source
        map.getSource('people').setData(geojson);
    })
    .catch(error => {
        console.error(error);
    });
}


function createGeojson(data) {
    // creating a deep copy of dummyGeojso
    let geoObj = JSON.parse(JSON.stringify(dummyGeojson));

    for (let i = 0; i < data.length; i++) {
        const element = data[i];

        // Create a point feature
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
        
        // add the feature to feature array
        geoObj.features.push(feature);
    }

    // return geojson data
    return geoObj;
}