package com.igcsscz.backend.modules.usuario;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.DiscriminatorType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Raíz abstracta de la jerarquía en tabla única. El administrador se modela con
 * {@code dtype = ADMINISTRADOR} y {@link RolEnum#ADMINISTRADOR} (sin módulo
 * {@code administrador} ni subclase de negocio).
 */
@Entity
@Table(name = "usuarios")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "dtype", discriminatorType = DiscriminatorType.STRING, length = 32)
@DiscriminatorValue("ADMINISTRADOR")
@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 180)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false, length = 120)
    private String apellido;

    @Column(length = 40)
    private String telefono;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private RolEnum rol;

    @Column(nullable = false)
    private boolean activo;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;
}
