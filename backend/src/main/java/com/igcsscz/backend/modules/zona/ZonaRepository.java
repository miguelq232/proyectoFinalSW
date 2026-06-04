package com.igcsscz.backend.modules.zona;

import com.igcsscz.backend.modules.camion.EstadoCamionEnum;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ZonaRepository extends JpaRepository<Zona, Long> {

    long countByActivaTrue();

    @Query(
            """
            SELECT z FROM Zona z
            WHERE NOT EXISTS (
                SELECT 1 FROM Camion c
                WHERE c.zona = z AND c.estado = :estadoActivo
            )
            ORDER BY z.nombre
            """)
    List<Zona> findZonasSinCamionActivo(EstadoCamionEnum estadoActivo);
}
