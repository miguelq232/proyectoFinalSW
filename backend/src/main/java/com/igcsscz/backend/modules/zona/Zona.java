package com.igcsscz.backend.modules.zona;

import com.igcsscz.backend.modules.camion.Camion;
import com.igcsscz.backend.modules.vecino.Vecino;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "zonas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Zona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 160)
    private String nombre;

    @Column(length = 2000)
    private String descripcion;

    private Double latitudCentro;

    private Double longitudCentro;

    private Double radioKm;

    @Column(nullable = false)
    private boolean activa;

    @OneToMany(mappedBy = "zona", fetch = FetchType.LAZY)
    private List<Vecino> vecinos = new ArrayList<>();

    @OneToMany(mappedBy = "zona", fetch = FetchType.LAZY)
    private List<Camion> camiones = new ArrayList<>();
}
