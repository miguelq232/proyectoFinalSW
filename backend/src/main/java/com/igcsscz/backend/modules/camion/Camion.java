package com.igcsscz.backend.modules.camion;

import com.igcsscz.backend.modules.operador.Operador;
import com.igcsscz.backend.modules.zona.Zona;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "camiones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Camion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 32)
    private String placa;

    @Column(length = 120)
    private String modelo;

    @Column(nullable = false)
    private Integer anio;

    @Column(length = 64)
    private String color;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private EstadoCamionEnum estado;

    @Column(nullable = false)
    private LocalDateTime fechaRegistro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zona_id")
    private Zona zona;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_id")
    private Operador operador;
}
