package com.igcsscz.backend.modules.vecino;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VecinoRepository extends JpaRepository<Vecino, Long> {

    Optional<Vecino> findByEmailIgnoreCase(String email);

    Optional<Vecino> findByCodigoQR(String codigoQR);

    @Query("SELECT v.zona.nombre, COUNT(v) FROM Vecino v WHERE v.zona IS NOT NULL GROUP BY v.zona.id, v.zona.nombre ORDER BY v.zona.nombre")
    List<Object[]> countVecinosGroupByZona();

    @Query(
            """
            SELECT CONCAT(v.nombre, ' ', v.apellido), v.email, COALESCE(v.puntosAcumulados, 0), COUNT(p)
            FROM Vecino v
            LEFT JOIN Puntos p ON p.vecino.id = v.id
            GROUP BY v.id, v.nombre, v.apellido, v.email, v.puntosAcumulados
            ORDER BY COALESCE(v.puntosAcumulados, 0) DESC
            """)
    List<Object[]> findTopVecinosPorPuntos(Pageable pageable);

    @Query(
            """
            SELECT z.nombre, COUNT(v),
                   SUM(CASE WHEN (SELECT COUNT(p) FROM Puntos p WHERE p.vecino = v) > 0 THEN 1 ELSE 0 END)
            FROM Vecino v
            JOIN v.zona z
            GROUP BY z.id, z.nombre
            ORDER BY z.nombre
            """)
    List<Object[]> findTasaReciclajePorZona();

    long countByZonaIsNotNull();

    long countByZonaIsNull();

    @Query("SELECT COUNT(v) FROM Vecino v WHERE v.latitud IS NOT NULL AND v.longitud IS NOT NULL")
    long countConUbicacion();

    @Query(
            """
            SELECT CONCAT(v.nombre, ' ', v.apellido), v.email, COALESCE(z.nombre, 'Sin zona'),
                   (SELECT MAX(p.fecha) FROM Puntos p WHERE p.vecino = v)
            FROM Vecino v
            LEFT JOIN v.zona z
            WHERE NOT EXISTS (SELECT 1 FROM Puntos p WHERE p.vecino = v AND p.fecha >= :desde)
            ORDER BY v.apellido, v.nombre
            """)
    List<Object[]> findVecinosInactivos(@Param("desde") LocalDateTime desde);

    @Query(
            value =
                    """
                    SELECT CAST(EXTRACT(YEAR FROM v.fecha_registro) AS int),
                           CAST(EXTRACT(MONTH FROM v.fecha_registro) AS int),
                           COUNT(v.id)
                    FROM usuarios v
                    WHERE v.dtype = 'VECINO'
                      AND v.fecha_registro >= :desde
                    GROUP BY EXTRACT(YEAR FROM v.fecha_registro), EXTRACT(MONTH FROM v.fecha_registro)
                    ORDER BY 1, 2
                    """,
            nativeQuery = true)
    List<Object[]> countNuevosRegistrosPorMes(@Param("desde") LocalDateTime desde);

    @Query("SELECT COALESCE(SUM(v.puntosAcumulados), 0) FROM Vecino v")
    Long sumPuntosAcumulados();

    @Query(
            """
            SELECT SUM(CASE WHEN COALESCE(v.puntosAcumulados, 0) = 0 THEN 1 ELSE 0 END),
                   SUM(CASE WHEN v.puntosAcumulados BETWEEN 1 AND 50 THEN 1 ELSE 0 END),
                   SUM(CASE WHEN v.puntosAcumulados BETWEEN 51 AND 100 THEN 1 ELSE 0 END),
                   SUM(CASE WHEN v.puntosAcumulados BETWEEN 101 AND 500 THEN 1 ELSE 0 END),
                   SUM(CASE WHEN v.puntosAcumulados > 500 THEN 1 ELSE 0 END)
            FROM Vecino v
            """)
    List<Object[]> countDistribucionPuntos();
}
