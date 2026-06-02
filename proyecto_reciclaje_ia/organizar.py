# import os
# import shutil

# # ==========================================
# # RUTAS EXACTAS
# # ==========================================
# GARBAGE   = r'C:\Users\Alexader\.cache\kagglehub\datasets\garbage_classification'
# REALWASTE = r'C:\Users\Alexader\.cache\kagglehub\datasets\joebeachcapital\realwaste\versions\1\realwaste-main\RealWaste'
# TRASHNET  = r'C:\Users\Alexader\.cache\kagglehub\datasets\asdasdasasdas\garbage-classification\versions\2\Garbage classification\Garbage classification'
# ALISTAIR  = r'C:\Users\Alexader\.cache\kagglehub\datasets\alistairking\recyclable-and-household-waste-classification\versions\1\images\images'

# OUTPUT = r'C:\xampp\htdocs\proyecto_reciclaje_ia\data\dataset_final'

# # ==========================================
# # 5 CATEGORIAS SEGUN EMPACAR S.A.
# # ==========================================
# FUENTES = {
#     'glass': [
#         (GARBAGE,   'brown-glass'),
#         (GARBAGE,   'green-glass'),
#         (GARBAGE,   'white-glass'),
#         (REALWASTE, 'Glass'),
#         (TRASHNET,  'glass'),
#         (ALISTAIR,  'glass_beverage_bottles'),
#         (ALISTAIR,  'glass_cosmetic_containers'),
#         (ALISTAIR,  'glass_food_jars'),
#     ],
#     'metal': [
#         (GARBAGE,   'metal'),
#         (REALWASTE, 'Metal'),
#         (TRASHNET,  'metal'),
#         (ALISTAIR,  'aerosol_cans'),
#         (ALISTAIR,  'aluminum_food_cans'),
#         (ALISTAIR,  'aluminum_soda_cans'),
#         (ALISTAIR,  'steel_food_cans'),
#     ],
#     'paper': [
#         (GARBAGE,   'paper'),
#         (GARBAGE,   'cardboard'),
#         (REALWASTE, 'Paper'),
#         (REALWASTE, 'Cardboard'),
#         (TRASHNET,  'paper'),
#         (TRASHNET,  'cardboard'),
#         (ALISTAIR,  'magazines'),
#         (ALISTAIR,  'newspaper'),
#         (ALISTAIR,  'office_paper'),
#         (ALISTAIR,  'paper_cups'),
#         (ALISTAIR,  'cardboard_boxes'),
#         (ALISTAIR,  'cardboard_packaging'),
#     ],
#     'pet': [
#         (GARBAGE,   'plastic'),
#         (REALWASTE, 'Plastic'),
#         (TRASHNET,  'plastic'),
#         (ALISTAIR,  'plastic_soda_bottles'),
#         (ALISTAIR,  'plastic_water_bottles'),
#     ],
#     'plastic': [
#         (ALISTAIR,  'plastic_detergent_bottles'),
#         (ALISTAIR,  'plastic_food_containers'),
#         (ALISTAIR,  'plastic_cup_lids'),
#         (ALISTAIR,  'disposable_plastic_cutlery'),
#     ],
# }

# # ==========================================
# # FUNCION PARA OBTENER FOTOS
# # ==========================================
# def get_fotos(base, carpeta):
#     ruta = os.path.join(base, carpeta)
#     if not os.path.exists(ruta):
#         fotos = []
#         for sub in ['default', 'real_world']:
#             sub_ruta = os.path.join(ruta, sub)
#             if os.path.exists(sub_ruta):
#                 fotos += [
#                     os.path.join(sub_ruta, f)
#                     for f in os.listdir(sub_ruta)
#                     if f.lower().endswith(('.jpg', '.jpeg', '.png'))
#                 ]
#         if not fotos:
#             print(f"  ⚠️  No existe: {ruta}")
#         return fotos

#     subdirs = [d for d in os.listdir(ruta) if os.path.isdir(os.path.join(ruta, d))]
#     if 'default' in subdirs or 'real_world' in subdirs:
#         fotos = []
#         for sub in ['default', 'real_world']:
#             sub_ruta = os.path.join(ruta, sub)
#             if os.path.exists(sub_ruta):
#                 fotos += [
#                     os.path.join(sub_ruta, f)
#                     for f in os.listdir(sub_ruta)
#                     if f.lower().endswith(('.jpg', '.jpeg', '.png'))
#                 ]
#         return fotos

#     return [
#         os.path.join(ruta, f)
#         for f in os.listdir(ruta)
#         if f.lower().endswith(('.jpg', '.jpeg', '.png'))
#     ]

# # ==========================================
# # CREAR CARPETAS
# # ==========================================
# print("Creando dataset final...")

# if os.path.exists(OUTPUT):
#     shutil.rmtree(OUTPUT)

# for categoria in FUENTES.keys():
#     os.makedirs(os.path.join(OUTPUT, categoria))

# # ==========================================
# # RECOLECTAR Y COPIAR
# # ==========================================
# for categoria, fuentes in FUENTES.items():
#     todas = []
#     for base_path, carpeta in fuentes:
#         fotos = get_fotos(base_path, carpeta)
#         todas.extend(fotos)
#         if fotos:
#             print(f"  {carpeta} → {categoria}: {len(fotos)} fotos")

#     dst = os.path.join(OUTPUT, categoria)
#     for i, foto in enumerate(todas):
#         ext = os.path.splitext(foto)[1].lower()
#         nueva = f"{categoria}_{i:04d}{ext}"
#         shutil.copy(foto, os.path.join(dst, nueva))

# # ==========================================
# # RESUMEN
# # ==========================================
# print("\n=== RESUMEN FINAL ===")
# total = 0
# for categoria in sorted(os.listdir(OUTPUT)):
#     ruta = os.path.join(OUTPUT, categoria)
#     cantidad = len(os.listdir(ruta))
#     total += cantidad
#     print(f"  {categoria}: {cantidad} fotos")
# print(f"\nTotal: {total} fotos")


import os
import shutil
import random

# ==========================================
# RUTAS EXACTAS
# ==========================================
GARBAGE   = r'C:\Users\Alexader\.cache\kagglehub\datasets\garbage_classification'
REALWASTE = r'C:\Users\Alexader\.cache\kagglehub\datasets\joebeachcapital\realwaste\versions\1\realwaste-main\RealWaste'
TRASHNET  = r'C:\Users\Alexader\.cache\kagglehub\datasets\asdasdasasdas\garbage-classification\versions\2\Garbage classification\Garbage classification'
ALISTAIR  = r'C:\Users\Alexader\.cache\kagglehub\datasets\alistairking\recyclable-and-household-waste-classification\versions\1\images\images'

OUTPUT      = r'C:\xampp\htdocs\proyecto_reciclaje_ia\data\dataset_final'
OUTPUT_TEST = r'C:\xampp\htdocs\proyecto_reciclaje_ia\data\dataset_test'

# ==========================================
# 5 CATEGORIAS SEGUN EMPACAR S.A.
# ==========================================
FUENTES = {
    'glass': [
        (GARBAGE,   'brown-glass'),
        (GARBAGE,   'green-glass'),
        (GARBAGE,   'white-glass'),
        (REALWASTE, 'Glass'),
        (TRASHNET,  'glass'),
        (ALISTAIR,  'glass_beverage_bottles'),
        (ALISTAIR,  'glass_cosmetic_containers'),
        (ALISTAIR,  'glass_food_jars'),
    ],
    'metal': [
        (GARBAGE,   'metal'),
        (REALWASTE, 'Metal'),
        (TRASHNET,  'metal'),
        (ALISTAIR,  'aerosol_cans'),
        (ALISTAIR,  'aluminum_food_cans'),
        (ALISTAIR,  'aluminum_soda_cans'),
        (ALISTAIR,  'steel_food_cans'),
    ],
    'paper': [
        (GARBAGE,   'paper'),
        (GARBAGE,   'cardboard'),
        (REALWASTE, 'Paper'),
        (REALWASTE, 'Cardboard'),
        (TRASHNET,  'paper'),
        (TRASHNET,  'cardboard'),
        (ALISTAIR,  'magazines'),
        (ALISTAIR,  'newspaper'),
        (ALISTAIR,  'office_paper'),
        (ALISTAIR,  'paper_cups'),
        (ALISTAIR,  'cardboard_boxes'),
        (ALISTAIR,  'cardboard_packaging'),
    ],
    'pet': [
        (GARBAGE,   'plastic'),
        (REALWASTE, 'Plastic'),
        (TRASHNET,  'plastic'),
        (ALISTAIR,  'plastic_soda_bottles'),
        (ALISTAIR,  'plastic_water_bottles'),
    ],
    'plastic': [
        (ALISTAIR,  'plastic_detergent_bottles'),
        (ALISTAIR,  'plastic_food_containers'),
        (ALISTAIR,  'plastic_cup_lids'),
        (ALISTAIR,  'disposable_plastic_cutlery'),
    ],
}

# ==========================================
# FUNCION PARA OBTENER FOTOS
# ==========================================
def get_fotos(base, carpeta):
    ruta = os.path.join(base, carpeta)
    if not os.path.exists(ruta):
        fotos = []
        for sub in ['default', 'real_world']:
            sub_ruta = os.path.join(ruta, sub)
            if os.path.exists(sub_ruta):
                fotos += [
                    os.path.join(sub_ruta, f)
                    for f in os.listdir(sub_ruta)
                    if f.lower().endswith(('.jpg', '.jpeg', '.png'))
                ]
        if not fotos:
            print(f"  ⚠️  No existe: {ruta}")
        return fotos

    subdirs = [d for d in os.listdir(ruta) if os.path.isdir(os.path.join(ruta, d))]
    if 'default' in subdirs or 'real_world' in subdirs:
        fotos = []
        for sub in ['default', 'real_world']:
            sub_ruta = os.path.join(ruta, sub)
            if os.path.exists(sub_ruta):
                fotos += [
                    os.path.join(sub_ruta, f)
                    for f in os.listdir(sub_ruta)
                    if f.lower().endswith(('.jpg', '.jpeg', '.png'))
                ]
        return fotos

    return [
        os.path.join(ruta, f)
        for f in os.listdir(ruta)
        if f.lower().endswith(('.jpg', '.jpeg', '.png'))
    ]

# ==========================================
# LIMITE
# ==========================================
LIMITE = 2000

# ==========================================
# CREAR CARPETAS
# ==========================================
print("Creando carpetas...")

for carpeta_out in [OUTPUT, OUTPUT_TEST]:
    if os.path.exists(carpeta_out):
        shutil.rmtree(carpeta_out)
    for categoria in FUENTES.keys():
        os.makedirs(os.path.join(carpeta_out, categoria))

# ==========================================
# RECOLECTAR, DIVIDIR Y COPIAR
# ==========================================
for categoria, fuentes in FUENTES.items():
    todas = []
    for base_path, carpeta in fuentes:
        fotos = get_fotos(base_path, carpeta)
        todas.extend(fotos)
        if fotos:
            print(f"  {carpeta} → {categoria}: {len(fotos)} fotos")

    random.shuffle(todas)

    train = todas[:LIMITE]
    test  = todas[LIMITE:]

    # Copiar train
    dst_train = os.path.join(OUTPUT, categoria)
    for i, foto in enumerate(train):
        ext = os.path.splitext(foto)[1].lower()
        shutil.copy(foto, os.path.join(dst_train, f"{categoria}_{i:04d}{ext}"))

    # Copiar test (solo si hay sobrante)
    dst_test = os.path.join(OUTPUT_TEST, categoria)
    for i, foto in enumerate(test):
        ext = os.path.splitext(foto)[1].lower()
        shutil.copy(foto, os.path.join(dst_test, f"{categoria}_{i:04d}{ext}"))

    print(f"  ✅ {categoria}: {len(train)} train / {len(test)} test")

# ==========================================
# RESUMEN
# ==========================================
print("\n=== DATASET FINAL (train) ===")
total = 0
for categoria in sorted(os.listdir(OUTPUT)):
    ruta = os.path.join(OUTPUT, categoria)
    cantidad = len(os.listdir(ruta))
    total += cantidad
    print(f"  {categoria}: {cantidad} fotos")
print(f"Total: {total} fotos")

print("\n=== DATASET TEST ===")
total_test = 0
for categoria in sorted(os.listdir(OUTPUT_TEST)):
    ruta = os.path.join(OUTPUT_TEST, categoria)
    cantidad = len(os.listdir(ruta))
    total_test += cantidad
    print(f"  {categoria}: {cantidad} fotos")
print(f"Total: {total_test} fotos")