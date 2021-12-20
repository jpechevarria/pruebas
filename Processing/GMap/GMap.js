angle = 0.01;
markers = [];
rotar = false;
escalar = true;
ladoMetros = 1 * 1000;
  
function setup() {
  createMarkers();
  centerMap(markers[0].getPosition());
  divResult = createDiv();
}

function createMarkers(){
    
  var pC = new Coord( -33.368122, -60.154143);
  addMarker(pC, 'Centro', 1);
  
  var pO = moveCoord(pC,-ladoMetros/2,1);
  pO = moveCoord(pO,-ladoMetros/2,2);
  var pA = moveCoord(pO,ladoMetros,1);
  var pB = moveCoord(pO,ladoMetros,2);
  var pD = moveCoord(pA,ladoMetros,2);  

  addMarker(pO, 'O', 2);
  addMarker(pA, 'A', 2);  
  addMarker(pB, 'B', 2);
  addMarker(pD, 'D', 2);

  //var diag = ladoMetros / 2 ; // CUADRADO
  var diag = sqrt(2 * ladoMetros * ladoMetros) / 2; // REDONDO

  var p1 = moveCoord(pC,+diag,1);
  var p2 = moveCoord(pC,-diag,1);
  var p3 = moveCoord(pC,+diag,2);
  var p4 = moveCoord(pC,-diag,2);

  addMarker(p1, 'p1', 3);
  addMarker(p2, 'p2', 3);
  addMarker(p3, 'p3', 3);
  addMarker(p4, 'p4', 3);

}

function centerMap(pos){
  mapG.setCenter(pos);
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < markers.length; i++) {
    bounds.extend(markers[i].getPosition());
  }
  mapG.fitBounds(bounds);
}

function draw() {
  background(255,0,0);
  
  // ROTACION
  if ( frameCount % 1 == 0 && rotar == true ) {
    
    // OBTIENE EL PUNTO DEL CENTRO
    var pC = 0;
    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i];
      if ( marker.title=='Centro') {
        var pos = marker.getPosition();
        pC = new Coord(pos.lat(),pos.lng());
      }
    }
    
    var distMinutoLat = getDistMinLat(pC.lat);
    var distMinutoLng = getDistMinLng(pC.lat, distMinutoLat);
    var scl = distMinutoLng / distMinutoLat;
    
    // ROTA EL RESTO DE LOS PUNTOS ALREDEDOR DEL CENTRO
    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i];
      if ( marker.title!='Centro') {
        var pos = marker.getPosition();
        var pX = new Coord(pos.lat(),pos.lng());
        
        var deltaPX = new Coord(pX.lat-pC.lat,pX.lng-pC.lng);
        if ( escalar ) {
          deltaPX.lng *= scl;
        }

        var teta = atan2(deltaPX.lng,deltaPX.lat) + angle;
        var nLat = deltaPX.lat * cos(angle) - deltaPX.lng * sin(angle);
        var nLng = deltaPX.lat * sin(angle) + deltaPX.lng * cos(angle);
        
        if ( escalar ) {
          nLng /= scl;
        }
        
        var nPX = new Coord(pC.lat + nLat, pC.lng + nLng);

        marker.setPosition(new google.maps.LatLng(nPX.lat,nPX.lng));
      }
    }
    
  }
  
  // MUESTRA DISTANCIAS
  if ( frameCount % 20 == 0 ) {
    var result = '';
    var dist = google.maps.geometry.spherical.computeDistanceBetween(markers[0].position,markers[1].position);
    result += 'Distancia de C a O: ' + round(dist,1) + '<br>';
    var dist = google.maps.geometry.spherical.computeDistanceBetween(markers[0].position,markers[2].position);
    result += 'Distancia de C a A: ' + round(dist,1) + '<br>';
    var dist = google.maps.geometry.spherical.computeDistanceBetween(markers[0].position,markers[3].position);
    result += 'Distancia de C a B: ' + round(dist,1) + '<br>';
    var dist = google.maps.geometry.spherical.computeDistanceBetween(markers[0].position,markers[4].position);
    result += 'Distancia de C a D: ' + round(dist,1) + '<br>';

    var dist = google.maps.geometry.spherical.computeDistanceBetween(markers[1].position,markers[2].position);
    result += 'Distancia de O a A: ' + round(dist,1) + '<br>';
    var dist = google.maps.geometry.spherical.computeDistanceBetween(markers[1].position,markers[3].position);
    result += 'Distancia de O a B: ' + round(dist,1) + '<br>';
    var dist = google.maps.geometry.spherical.computeDistanceBetween(markers[2].position,markers[4].position);
    result += 'Distancia de A a D: ' + round(dist,1) + '<br>';
    var dist = google.maps.geometry.spherical.computeDistanceBetween(markers[3].position,markers[4].position);
    result += 'Distancia de B a D: ' + round(dist,1) + '<br>';
    
    divResult.html(result);
    // PRUEBAS
    var pX = new Coord( 90, -60);
    var pY = new Coord( 90-minuto, -60);
    var dist = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(pX.lat,pX.lng),new google.maps.LatLng(pY.lat,pY.lng));
    
    var result = divResult.html();
    result += 'Dist X a Y: ' + round(dist,20) + '<br>'; 
    divResult.html(result);
  }
  
}

function addMarker(coord, titulo, col) {
      if ( col == 1 ) {
        var icono = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
      }
      else if ( col == 2 ){
        var icono = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
      }
      else if ( col == 3 ){
        var icono = 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
      }
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(coord.lat,coord.lng),
        title:titulo,
        icon: icono, //SI QUIERO EL ESTILO NORMAL DE GOOGLE MAPS NO PONER ESTA LINEA
        map: mapG,
        });
      markers.push(marker);
}

function Coord(lat, lng) {
  this.lat = lat;
  this.lng = lng;
}

minuto = 1 / 60;

function getDistMinLng(lat, distLat) {
  return cos(radians(lat)) * distLat;
}

function getDistMinLat(lat) {
  return distMinutoLat =  1855.325 
  
  /* VARIABILIZACION SEGUN LATITUD 
  var distMedia =  1852.16138511;
  var distAmplitud =  9.33049102;
  
  return distMedia+cos(radians(2*lat-180))*distAmplitud;
  //*/
}

function moveCoord(coord, dist, eje) {
  var ret = new Coord(coord.lat,coord.lng);

  var distMinutoLat = getDistMinLat(ret.lat);
  if ( eje == 1 ) // mueve en latitud
  {
    var dir = -1; //SUR
    var deltaLat = dir * (dist / distMinutoLat * minuto);
    ret.lat += deltaLat;
  }
  else if ( eje == 2 ) // mueve en longitud
  {
    var dir = 1; //ESTE
    var distMinutoLng = getDistMinLng(ret.lat, distMinutoLat);
    var deltaLng = dir * ( dist / distMinutoLng * minuto );
    ret.lng += deltaLng;
  }
  return ret;
}

function keyPressed() {
  if (keyCode == 82) { // R
    rotar = !rotar;
  }
  else if (keyCode == 67) { // C
    clearMarkers();
    createMarkers();
  }
  else if (keyCode == 83) { // S
    escalar = !escalar;
  }

}

function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}