valor = 44;
valorMaximo = 100;
diametroExt = 200;
diametroInt = 140;

function setup() {
  createCanvas(800,400);
  
  createElement('br');
  slider = createSlider(0, valorMaximo, valor);
  createElement('br');
  createSpan('Valor Maximo: ');
  inpValorMaximo = createInput(valorMaximo);
  createElement('br');
  createSpan('Valor Actual: ');
  inpValor = createInput(valor);

  createElement('br');
  sliderAngIni = createSlider(-180, 180, 0);

}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function draw() {
  var txtValorMaximo = inpValorMaximo.value();
  //console.log(txtValorMaximo);
  if ( isNumeric(txtValorMaximo) ) {
    var valorMaxNuevo = parseFloat(txtValorMaximo);
    if ( valorMaxNuevo > 0 ) {
      valorMaximo = valorMaxNuevo;
      slider.attribute('max',valorMaximo.toString());
    }
  }
  //console.log('PASO!');
  //console.log(valorMaximo);
  
  valor = slider.value();
  inpValor.value(valor);
  var porcPintado = (valor / valorMaximo);

  background(255);
  
  colorVacio = color(200);

  // COLOR CELEST: color(103, 209, 234)
  // COLOR NARANJA TX: color(247, 166, 0)
  colorRelleno = color(247, 166, 0);

  drawIndicador(150,150,porcPintado, colorRelleno);
  
  // ROJO TX: (242,62,1)
  colorRelleno = color(242, 62, 1);
  drawIndicador(400,150,porcPintado, colorRelleno, true);
}

function drawIndicador(xCentro,yCentro, porcPintado, colorPintado, esPorc) {
  var angIni = 0;
  var angFin = TWO_PI * porcPintado;
  
  if ( angFin == 0 ) {
    angFin = 1e-10;
  }
  if ( angFin > TWO_PI - 1e-10 ) {
    angFin = TWO_PI - 1e-10;
  }

  angIni = sliderAngIni.value() * (TWO_PI/360);

  noStroke();
  
  fill(colorPintado);
  arc(xCentro, yCentro, diametroExt, diametroExt, angIni, angIni + angFin);
  
  fill(colorVacio);
  arc(xCentro, yCentro, diametroExt, diametroExt, angIni + angFin, angIni + TWO_PI);

  fill(255);
  ellipse(xCentro, yCentro, diametroInt, diametroInt);
  
  fill(colorRelleno);
  textSize(50);
  textStyle(BOLD);
  textAlign(CENTER,CENTER)
  
  txtValor = str(valor);
  if ( esPorc )
  {
    txtValor += '%';
  }
  
  text(txtValor,xCentro,yCentro);
  
}
