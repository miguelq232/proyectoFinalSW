package com.igcsscz.backend.modules.puntos;

import com.igcsscz.backend.modules.vecino.Vecino;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "puntos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Puntos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vecino_id", nullable = false)
    private Vecino vecino;

    @Column(name = "tipo_residuo", length = 50)
    private String tipoResiduo;

    @Column(nullable = true)
    private Double cantidad;

    @Column(name = "puntos_otorgados")
    private Integer puntosOtorgados;

    @Column(nullable = true)
    private LocalDateTime fecha;

    @Column(length = 500, nullable = true)
    private String descripcion;
}
