package com.igcsscz.backend.modules.puntos;

import com.igcsscz.backend.modules.puntos.dto.PuntosRequestDTO;
import com.igcsscz.backend.modules.puntos.dto.PuntosResponseDTO;
import com.igcsscz.backend.modules.vecino.Vecino;
import com.igcsscz.backend.modules.vecino.VecinoRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PuntosService {

    private final PuntosRepository puntosRepository;
    private final VecinoRepository vecinoRepository;

    public PuntosService(PuntosRepository puntosRepository, VecinoRepository vecinoRepository) {
        this.puntosRepository = puntosRepository;
        this.vecinoRepository = vecinoRepository;
    }

    @Transactional
    public PuntosResponseDTO registrarDeposito(PuntosRequestDTO request) {
        if (request.getCodigoQR() == null || request.getCodigoQR().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El código QR es obligatorio");
        }

        Vecino vecino =
                vecinoRepository
                        .findByCodigoQR(request.getCodigoQR().trim())
                        .orElseThrow(
                                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vecino no encontrado"));

        int puntosOtorgados = calcularPuntos(request.getTipoResiduo(), request.getCantidad());

        if (puntosOtorgados > 0) {
            int actuales = vecino.getPuntosAcumulados() != null ? vecino.getPuntosAcumulados() : 0;
            vecino.setPuntosAcumulados(actuales + puntosOtorgados);
            vecinoRepository.save(vecino);
        }

        Puntos registro = new Puntos();
        registro.setVecino(vecino);
        registro.setTipoResiduo(request.getTipoResiduo());
        registro.setCantidad(request.getCantidad());
        registro.setPuntosOtorgados(puntosOtorgados);
        registro.setFecha(LocalDateTime.now());
        registro.setDescripcion(request.getDescripcion());

        Puntos guardado = puntosRepository.save(registro);
        return toResponseDTO(guardado);
    }

    @Transactional(readOnly = true)
    public List<PuntosResponseDTO> getHistorialVecino(String email) {
        Vecino vecino = findVecinoByEmail(email);
        return puntosRepository.findByVecinoIdOrderByFechaDesc(vecino.getId()).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public Integer getPuntosVecino(String email) {
        Vecino vecino = findVecinoByEmail(email);
        Integer total = puntosRepository.sumPuntosOtorgadosByVecinoId(vecino.getId());
        return total != null ? total : 0;
    }

    private Vecino findVecinoByEmail(String email) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        return vecinoRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vecino no encontrado"));
    }

    private int calcularPuntos(String tipoResiduo, Double cantidad) {
        if (tipoResiduo == null || tipoResiduo.isBlank()) {
            return 0;
        }

        int rate =
                switch (tipoResiduo.trim().toUpperCase()) {
                    case "PLASTICO" -> 10;
                    case "VIDRIO" -> 15;
                    case "PAPEL" -> 8;
                    case "METAL" -> 20;
                    case "ORGANICO" -> 5;
                    default -> 0;
                };

        if (rate == 0) {
            return 0;
        }

        double qty = cantidad != null && cantidad > 0 ? cantidad : 1.0;
        return (int) Math.round(rate * qty);
    }

    private PuntosResponseDTO toResponseDTO(Puntos puntos) {
        PuntosResponseDTO dto = new PuntosResponseDTO();
        dto.setId(puntos.getId());
        dto.setVecinoId(puntos.getVecino().getId());
        dto.setVecinoNombre(puntos.getVecino().getNombre() + " " + puntos.getVecino().getApellido());
        dto.setTipoResiduo(puntos.getTipoResiduo());
        dto.setCantidad(puntos.getCantidad());
        dto.setPuntosOtorgados(puntos.getPuntosOtorgados());
        dto.setFecha(puntos.getFecha());
        dto.setDescripcion(puntos.getDescripcion());
        return dto;
    }
}
