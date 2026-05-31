package com.igcsscz.backend.modules.zona;

import com.igcsscz.backend.modules.zona.dto.ZonaRequestDTO;
import com.igcsscz.backend.modules.zona.dto.ZonaResponseDTO;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ZonaService {

    private final ZonaRepository zonaRepository;

    public ZonaService(ZonaRepository zonaRepository) {
        this.zonaRepository = zonaRepository;
    }

    @Transactional(readOnly = true)
    public List<ZonaResponseDTO> getAllZonas() {
        return zonaRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ZonaResponseDTO getZonaById(Long id) {
        Zona zona = zonaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zona no encontrada"));
        return toResponseDTO(zona);
    }

    @Transactional
    public ZonaResponseDTO createZona(ZonaRequestDTO request) {
        Zona zona = new Zona();
        zona.setNombre(request.getNombre().trim());
        zona.setDescripcion(request.getDescripcion() != null ? request.getDescripcion().trim() : null);
        zona.setLatitudCentro(request.getLatitudCentro());
        zona.setLongitudCentro(request.getLongitudCentro());
        zona.setRadioKm(request.getRadioKm());
        zona.setActiva(request.getActiva() != null ? request.getActiva() : true);

        Zona saved = zonaRepository.save(zona);
        return toResponseDTO(saved);
    }

    @Transactional
    public ZonaResponseDTO updateZona(Long id, ZonaRequestDTO request) {
        Zona zona = zonaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zona no encontrada"));

        zona.setNombre(request.getNombre().trim());
        zona.setDescripcion(request.getDescripcion() != null ? request.getDescripcion().trim() : null);
        zona.setLatitudCentro(request.getLatitudCentro());
        zona.setLongitudCentro(request.getLongitudCentro());
        zona.setRadioKm(request.getRadioKm());
        if (request.getActiva() != null) {
            zona.setActiva(request.getActiva());
        }

        Zona saved = zonaRepository.save(zona);
        return toResponseDTO(saved);
    }

    @Transactional
    public void deleteZona(Long id) {
        Zona zona = zonaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zona no encontrada"));
        
        // Desvincular de los camiones y vecinos para evitar violación de FK
        zona.getVecinos().forEach(v -> v.setZona(null));
        zona.getCamiones().forEach(c -> c.setZona(null));
        
        zonaRepository.delete(zona);
    }

    @Transactional
    public ZonaResponseDTO toggleActive(Long id) {
        Zona zona = zonaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zona no encontrada"));
        zona.setActiva(!zona.isActiva());
        Zona saved = zonaRepository.save(zona);
        return toResponseDTO(saved);
    }

    public ZonaResponseDTO toResponseDTO(Zona z) {
        ZonaResponseDTO dto = new ZonaResponseDTO();
        dto.setId(z.getId());
        dto.setNombre(z.getNombre());
        dto.setDescripcion(z.getDescripcion());
        dto.setLatitudCentro(z.getLatitudCentro());
        dto.setLongitudCentro(z.getLongitudCentro());
        dto.setRadioKm(z.getRadioKm());
        dto.setActiva(z.isActiva());
        dto.setCantidadVecinos(z.getVecinos() != null ? z.getVecinos().size() : 0);
        dto.setCantidadCamiones(z.getCamiones() != null ? z.getCamiones().size() : 0);
        return dto;
    }
}
