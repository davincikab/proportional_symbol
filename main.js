// replace with your access token
mapboxgl.accessToken = 'pk.eyJ1IjoiZGF1ZGk5NyIsImEiOiJjanJtY3B1bjYwZ3F2NGFvOXZ1a29iMmp6In0.9ZdvuGInodgDk7cv-KlujA';

// create a map instance
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    zoom: 1.4,
    center: [9.96420545488088, 25.499103553541858]
});

// data url
var apiUrl = "https://www.fullylinked.com/api/getStatistics/";

// empty geojson
var dummyGeojson = {
    "type": "FeatureCollection",
    "features": []
};

var pointId = null;
var popup = new mapboxgl.Popup({closeOnClick:false});

// wait for map to load to add data sources, interactivity etc
map.on("load", function(e) {
    // create people data source
    map.addSource('people', {
        'type':'geojson',
        'data':dummyGeojson,
        'generateId':true
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
            'circle-color':'#ff0000',
            'circle-opacity':0.2,
            'circle-stroke-width':1,
            'circle-stroke-color':['case', ['boolean', ['feature-state', 'hover'], !1], '#000', '#ff0000']
        },
        'layout':{
            'visibility':'visible'
        }
    });

    // change the cursor
    map.on("mousemove", 'people-layer', function(e){
        map.getCanvas().style.cursor = 'pointer';

        // features
        if(e.features.length > 0) {
            // check the point id
            if(pointId) {
                map.removeFeatureState({
                    source: "people"
                  });
            }

            pointId = e.features[0].id;

            // updated the feature state
            map.setFeatureState({
                source:'people',
                id:pointId
            },{
                hover:true
            });

            // update popup
            updatePopup(e.features[0]);
        }
    });

    map.on("mouseleave", "people-layer", function(e) {
        // reset the pointId
        if(pointId) {
            map.setFeatureState({
                source:'people',
                id:pointId
            },{
                hover:false
            });
        }

        pointId = null
        
        popup.remove();
        map.getCanvas().style.cursor = '';
    });

    // layer interaction: display popup on click
    map.on("click", 'people-layer', function(e) {
        let features = map.queryRenderedFeatures(e.point,{
            layer:['peopple-layer']
        });

        if(features[0]) {
            let feature = features[0];

            updatePopup(feature);
        }
    });

    // load data with the given index
    getData(1);
});

function updatePopup(feature) {
    let htmlContent = "<div class='popup-content'>" + 
        "<h5 class='popup-header'>" + feature.properties.name + "</h5>"+
        "<p> Total " + feature.properties.total + "</p>"+
    "</div>"

    // create popup and add it to the map
    popup
        .setLngLat(feature.geometry.coordinates)
        .setHTML(htmlContent)
        .setMaxWidth("250")
        .addTo(map);
}


// Extract the data from the api
function getData(index) {
    let url = apiUrl + index;
    fetch("points.json" ,{
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