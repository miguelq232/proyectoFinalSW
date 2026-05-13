package com.igcsscz.backend.modules.vecino;

import com.igcsscz.backend.modules.usuario.Usuario;
import com.igcsscz.backend.modules.zona.Zona;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("VECINO")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vecino extends Usuario {

    @Column(length = 500)
    private String direccion;

    private Double latitud;

    private Double longitud;

    @Column(length = 512)
    private String codigoQR;

    @Column(nullable = false)
    private Integer puntosAcumulados;

    @Column(nullable = false)
    private LocalDateTime fechaRegistro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zona_id")
    private Zona zona;
}
