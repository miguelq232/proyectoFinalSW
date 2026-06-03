package com.igcsscz.backend.modules.config;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "config_puntos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfigPuntos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String categoria;

    @Column(name = "puntos_unidad", nullable = true)
    private Integer puntosUnidad;

    @Column(name = "puntos_kg", nullable = true)
    private Double puntosKg;

    @Column(name = "modo_calculo", nullable = false, length = 20)
    private String modoCalculo;

    @Column(nullable = false)
    private Boolean activo;
}
