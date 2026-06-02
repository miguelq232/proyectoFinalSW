"""
Entrenamiento de clasificación de residuos reciclables.
EfficientNetB0 + transfer learning sobre dataset_final (5 clases).
"""

import os
import json
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

# ==========================================
# CONFIGURACIÓN
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "data", "dataset_final")
MODEL_PATH = os.path.join(BASE_DIR, "modelo.h5")
PLOT_PATH = os.path.join(BASE_DIR, "curvas_entrenamiento.png")

CLASES = ["glass", "metal", "paper", "pet", "plastic"]
NUM_CLASES = len(CLASES)

IMG_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 100
VAL_SPLIT = 0.2
SEED = 42


def prepare_model_for_save(model):
    """Convierte tensores Eager en capas a numpy para que model.save() no falle."""
    def _set_numpy_attr(layer, attr, value):
        if tf.is_tensor(value):
            value = value.numpy()
        layer._setattr_tracking = False
        setattr(layer, attr, value)
        layer._setattr_tracking = True

    def _visit(layer):
        if isinstance(layer, tf.keras.layers.BatchNormalization):
            for attr in ("moving_mean", "moving_variance", "beta", "gamma"):
                if hasattr(layer, attr):
                    _set_numpy_attr(layer, attr, getattr(layer, attr))
        elif isinstance(layer, tf.keras.layers.Rescaling):
            for attr in ("scale", "offset"):
                if hasattr(layer, attr):
                    _set_numpy_attr(layer, attr, getattr(layer, attr))
        if hasattr(layer, "layers"):
            for sublayer in layer.layers:
                _visit(sublayer)

    for layer in model.layers:
        _visit(layer)


class SaveBestModel(tf.keras.callbacks.Callback):
    """Guarda modelo.h5 cuando mejora val_accuracy."""

    def __init__(self, filepath):
        super().__init__()
        self.filepath = filepath
        self.best_val_accuracy = 0.0

    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        val_acc = logs.get("val_accuracy", 0.0)
        if val_acc > self.best_val_accuracy:
            self.best_val_accuracy = val_acc
            prepare_model_for_save(self.model)
            self.model.save(self.filepath)
            print(f"  → Mejor modelo guardado en {self.filepath} (val_accuracy: {val_acc:.4f})")


def contar_imagenes():
    total = 0
    for clase in CLASES:
        ruta = os.path.join(DATASET_PATH, clase)
        if not os.path.isdir(ruta):
            raise FileNotFoundError(f"No existe la carpeta de clase: {ruta}")
        n = len([f for f in os.listdir(ruta) if os.path.isfile(os.path.join(ruta, f))])
        print(f"  {clase}: {n} imágenes")
        total += n
    return total


def build_model(trainable_base=False):
    base_model = EfficientNetB0(
        input_shape=(*IMG_SIZE, 3),
        include_top=False,
        weights="imagenet",
    )
    base_model.trainable = trainable_base

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation="relu")(x)
    x = BatchNormalization()(x)
    x = Dropout(0.4)(x)
    outputs = Dense(NUM_CLASES, activation="softmax")(x)

    model = Model(inputs=base_model.input, outputs=outputs)
    return model, base_model


def merge_histories(*histories):
    merged = {}
    for key in ("accuracy", "val_accuracy", "loss", "val_loss"):
        merged[key] = []
        for h in histories:
            merged[key].extend(h.history[key])
    return merged


def plot_curves(history, phase_split=None):
    fig, axes = plt.subplots(1, 2, figsize=(12, 4))

    axes[0].plot(history["accuracy"], label="Train accuracy")
    axes[0].plot(history["val_accuracy"], label="Val accuracy")
    axes[0].set_title("Accuracy por época")
    axes[0].set_xlabel("Época")
    axes[0].set_ylabel("Accuracy")
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)

    axes[1].plot(history["loss"], label="Train loss")
    axes[1].plot(history["val_loss"], label="Val loss")
    axes[1].set_title("Loss por época")
    axes[1].set_xlabel("Época")
    axes[1].set_ylabel("Loss")
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)

    if phase_split is not None:
        for ax in axes:
            ax.axvline(x=phase_split, color="red", linestyle="--", alpha=0.7, label="Fine-tuning")
            ax.legend()

    plt.tight_layout()
    plt.savefig(PLOT_PATH, dpi=150)
    print(f"Gráficas guardadas en: {PLOT_PATH}")
    plt.show()


def main():
    print("=" * 50)
    print("Entrenamiento EfficientNetB0 - Reciclaje IA")
    print("=" * 50)
    print(f"Dataset: {DATASET_PATH}")
    print("Distribución:")
    total = contar_imagenes()
    print(f"Total: {total} imágenes\n")

    gpus = tf.config.list_physical_devices("GPU")
    print(f"GPU disponible: {gpus if gpus else 'No (CPU)'}\n")

    # Augmentation: rotación, flip, zoom (+ preprocess EfficientNet)
    train_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input,
        rotation_range=25,
        horizontal_flip=True,
        vertical_flip=False,
        zoom_range=0.2,
        fill_mode="nearest",
        validation_split=VAL_SPLIT,
    )

    val_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input,
        validation_split=VAL_SPLIT,
    )

    train_generator = train_datagen.flow_from_directory(
        DATASET_PATH,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        classes=CLASES,
        subset="training",
        seed=SEED,
        shuffle=True,
    )

    val_generator = val_datagen.flow_from_directory(
        DATASET_PATH,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        classes=CLASES,
        subset="validation",
        seed=SEED,
        shuffle=False,
    )

    print(f"Índices de clases: {train_generator.class_indices}")
    print(f"Train: {train_generator.samples} | Val: {val_generator.samples}\n")

    callbacks = [
        EarlyStopping(
            monitor="val_accuracy",
            patience=12,
            restore_best_weights=True,
            verbose=1,
        ),
        ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.3,
            patience=4,
            min_lr=1e-7,
            verbose=1,
        ),
        SaveBestModel(MODEL_PATH),
    ]

    # ---------- Fase 1: Transfer learning (base congelada) ----------
    print("Fase 1 — Transfer learning (EfficientNetB0 congelado)...")
    model, base_model = build_model(trainable_base=False)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    history1 = model.fit(
        train_generator,
        epochs=EPOCHS,
        validation_data=val_generator,
        callbacks=callbacks,
        verbose=1,
    )

    # ---------- Fase 2: Fine-tuning (últimas capas del backbone) ----------
    print("\nFase 2 — Fine-tuning (últimas capas descongeladas)...")
    base_model.trainable = True
    for layer in base_model.layers[:-40]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    history2 = model.fit(
        train_generator,
        epochs=30,
        validation_data=val_generator,
        callbacks=callbacks,
        verbose=1,
    )

    # Guardar índices de clases
    clases_path = os.path.join(BASE_DIR, "clases.json")
    clases_inv = {v: k for k, v in train_generator.class_indices.items()}
    with open(clases_path, "w", encoding="utf-8") as f:
        json.dump(clases_inv, f, indent=2)
    print(f"Clases guardadas en: {clases_path}")

    # Curvas combinadas
    history = merge_histories(history1, history2)
    split_epoch = len(history1.history["loss"])
    plot_curves(history, phase_split=split_epoch)

    print("\nEntrenamiento finalizado.")
    print(f"Mejor modelo: {MODEL_PATH}")


if __name__ == "__main__":
    main()
