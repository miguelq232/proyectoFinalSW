Gris oscuro: Envases metalicos
Naranja: Botellas Pet
Azul: Carton y papel
Amarillo: Envases de plastico
Gris claro: Envases de vidrio




(Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned) ; (& c:\xampp\htdocs\proyecto_reciclaje_ia\venv\Scripts\Activate.ps1)







Informe — Proyecto Reciclaje IA
Fecha: 29/05/2026

¿Qué hicimos?
1. Definición de categorías
Basándonos en la Ecoestación de Empacar S.A. de Santa Cruz, definimos las 5 categorías reales del departamento:
CategoríaContenedorColorglassEnvases de vidrioGris clarometalEnvases metálicosGris oscuropaperCartón y papelAzulpetBotellas PETNaranjaplasticEnvases plásticos durosAmarillo
Estrategia de rechazo: Solo 5 categorías + umbral de confianza 55%. Si el modelo no supera 55% → "No es reciclable aquí".

2. Dataset
Fuentes utilizadas:

garbage_classification → dataset original
joebeachcapital → RealWaste
asdasdasasdas → TrashNet
alistairking → Recyclable and Household Waste

Descartados:

arkadiyhacks → imágenes repetidas con variación de ángulo
balanced, train, val → duplicados del mismo dataset
sapal6, techsash → categorías N/O/R no útiles

Dataset final:
glass:   2000 fotos train / 2432 test
metal:   2000 fotos train / 1969 test
paper:   2000 fotos train / 4899 test
pet:     2000 fotos train / 1268 test
plastic: 2000 fotos train /    0 test
─────────────────────────────────────
Total:  10000 fotos train / 10568 test

3. Entrenamiento
Modelo: EfficientNetB0 + Transfer Learning de ImageNet
Configuración:
IMG_SIZE:   224x224
BATCH_SIZE: 16 (por VRAM limitada)
EPOCHS:     100 máximo
VAL_SPLIT:  20%
GPU:        NVIDIA GeForce RTX 2050
Resultado Fase 1:
Épocas entrenadas: 23 (early stopping)
Mejor val_accuracy: 92.9%
Modelo guardado:   modelo.h5 (20MB)
Fase 2 (fine-tuning): Falló por bug de TensorFlow 2.10 con BatchNormalization. Pendiente de corregir si se necesita mejorar accuracy.

4. Pruebas con dataset_test
glass:   88%  ✅
metal:   90%  ✅
paper:   98%  ✅
pet:     90%  ✅
plastic: N/A  (sin fotos de test)
─────────────────────────────────
Promedio: 91.5%

5. Archivos generados
modelo.h5          → modelo entrenado (20MB)
clases.json        → mapeo de índices a categorías
curvas_entrenamiento.png → pendiente (falló con Fase 2)
organizar.py       → script de preparación de dataset
entrenar.py        → script de entrenamiento

¿Dónde quedamos?
Completado:

✅ Dataset preparado y organizado
✅ Modelo entrenado con 92.9% accuracy
✅ Pruebas básicas con dataset_test

Pendiente para mañana:

⏳ Buscar fotos de plastic para el test
⏳ Probar con fotos reales (celular, objetos reales)
⏳ Crear endpoint FastAPI /predecir
⏳ Integrar con Flutter
⏳ Arreglar Fase 2 fine-tuning (opcional, solo si se necesita más accuracy)


Decisiones tomadas:

92.9% es suficiente para el proyecto universitario
Umbral de confianza: 55%
No se usó clase unknown — el umbral cubre objetos desconocidos

