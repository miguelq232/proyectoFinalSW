package com.igcsscz.backend.modules.vecino;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VecinoRepository extends JpaRepository<Vecino, Long> {

    Optional<Vecino> findByEmailIgnoreCase(String email);
}
