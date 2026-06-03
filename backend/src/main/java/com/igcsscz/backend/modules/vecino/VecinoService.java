package com.igcsscz.backend.modules.vecino;

import com.igcsscz.backend.modules.vecino.dto.VecinoResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VecinoService {

    private final VecinoRepository vecinoRepository;

    public VecinoService(VecinoRepository vecinoRepository) {
        this.vecinoRepository = vecinoRepository;
    }

    @Transactional(readOnly = true)
    public VecinoResponseDTO getMyProfile(String email) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        Vecino vecino = vecinoRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vecino no encontrado"));
        return toResponseDTO(vecino);
    }

    private VecinoResponseDTO toResponseDTO(Vecino vecino) {
        VecinoResponseDTO dto = new VecinoResponseDTO();
        dto.setId(vecino.getId());
        dto.setNombre(vecino.getNombre());
        dto.setApellido(vecino.getApellido());
        dto.setEmail(vecino.getEmail());
        dto.setTelefono(vecino.getTelefono());
        dto.setDireccion(vecino.getDireccion());
        dto.setLatitud(vecino.getLatitud());
        dto.setLongitud(vecino.getLongitud());
        dto.setCodigoQR(vecino.getCodigoQR());
        dto.setPuntosAcumulados(vecino.getPuntosAcumulados());
        dto.setActivo(vecino.isActivo());
        if (vecino.getZona() != null) {
            dto.setZonaId(vecino.getZona().getId());
            dto.setZonaNombre(vecino.getZona().getNombre());
        }
        return dto;
    }
}
