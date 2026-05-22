// 1. EL CUADERNO DE DIBUJO (Configuración de la Pizarra)
const canvas = document.getElementById('pizarra');
const ctx = canvas.getContext('2d');
let dibujando = false;

// Configuración del "lapicero" para la firma
ctx.strokeStyle = '#000000'; // Color de la tinta (Negro)
ctx.lineWidth = 2;           // Grosor de la línea
ctx.lineCap = 'round';       // Hace que los trazos no se vean cuadrados y feos

// 2. ESCUCHAR LOS MOVIMIENTOS DEL MOUSE (Para firmar)
canvas.addEventListener('mousedown', () => dibujando = true);
canvas.addEventListener('mouseup', () => {
    dibujando = false;
    ctx.beginPath(); // Corta el trazo para que no se unan las palabras al levantar el mouse
    guardarFirmaOculta(); // Guarda la foto de la firma en el input secreto
});

canvas.addEventListener('mousemove', (evento) => {
    if (!dibujando) return;
    
    // Conseguir la posición exacta del mouse dentro del cuadro gris
    const rect = canvas.getBoundingClientRect();
    const x = evento.clientX - rect.left;
    const y = evento.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke(); // Dibuja la línea
    ctx.beginPath();
    ctx.moveTo(x, y);
});

// 3. EL BOTÓN DE BORRAR (Por si el usuario firma feo)
document.getElementById('btnLimpiar').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Borra todo el tablero
    document.getElementById('Firma_Digital').value = ""; // Vacía el input oculto
});

// 4. EL TRUCO MÁGICO: Guardar la firma en texto para la base de datos
function guardarFirmaOculta() {
    // Convierte el dibujo del canvas en un texto larguísimo (Base64)
    const datosFirma = canvas.toDataURL();
    // Lo guarda en el input invisible que creamos en el HTML
    document.getElementById('Firma_Digital').value = datosFirma;
}


// 5. EL PORTERO Y MENSAJERO (Enviar actualización con PUT)
// ==========================================================
document.getElementById('formActa').addEventListener('submit', function(evento) {
    evento.preventDefault(); 

    const formulario = this;
    const formData = new FormData(formulario);

    // Empacamos los datos incluyendo el IMEI 1 y el nuevo IMEI 2
    const datosParaServidor = {
        Fecha:              formData.get('Fecha') || "",
        Codigo_Nomina:      formData.get('Codigo_Nomina') || "",
        Funcionario:        formData.get('Funcionario') || "",
        Cedula:             formData.get('Cedula') || "",
        Suma_Descuento:     formData.get('Suma_Descuento') || "",
        Forma_Pago:         formData.get('Forma_Pago') || "",
        MODELO:             formData.get('MODELO') || "",
        IMEI1:              formData.get('IMEI1') || "",
        IMEI2:              formData.get('IMEI2') || "", // <-- Capturamos el IMEI 2
        Concepto_Descuento: formData.get('Concepto_Descuento') || "",
        firma_digital:      document.getElementById('Firma_Digital').value || ""
    };

    // Cambiamos el camión a método 'PUT' para indicarle al servidor que es una actualización
    fetch('http://localhost:8080/guardar_descuento', {
        method: 'PUT', // <-- ¡CAMBIADO A PUT! Lógica de actualización pura
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosParaServidor)
    })
    .then(respuesta => {
        if (respuesta.ok) {
            alert('¡Éxito! Los datos del celular robado se actualizaron correctamente en el servidor.');
        } else {
            alert('Hubo un problema en el servidor al intentar actualizar el documento.');
        }
    })
    .catch(error => {
        console.error('Error de conexión:', error);
        alert('No se pudo conectar con el servidor.');
    });
});