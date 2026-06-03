package com.igcsscz.backend.modules.vecino;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
}
