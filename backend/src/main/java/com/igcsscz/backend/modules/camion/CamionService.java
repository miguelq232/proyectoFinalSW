package com.igcsscz.backend.modules.camion;

import com.igcsscz.backend.modules.camion.dto.CamionRequestDTO;
import com.igcsscz.backend.modules.camion.dto.CamionResponseDTO;
import com.igcsscz.backend.modules.operador.Operador;
import com.igcsscz.backend.modules.operador.OperadorRepository;
import com.igcsscz.backend.modules.zona.Zona;
import com.igcsscz.backend.modules.zona.ZonaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CamionService {

    private final CamionRepository camionRepository;
    private final ZonaRepository zonaRepository;
    private final OperadorRepository operadorRepository;

    public CamionService(
            CamionRepository camionRepository,
            ZonaRepository zonaRepository,
            OperadorRepository operadorRepository) {
        this.camionRepository = camionRepository;
        this.zonaRepository = zonaRepository;
        this.operadorRepository = operadorRepository;
    }

    @Transactional(readOnly = true)
    public List<CamionResponseDTO> getAllCamiones() {
        return camionRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CamionResponseDTO getCamionById(Long id) {
        Camion camion = camionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Camión no encontrado"));
        return toResponseDTO(camion);
    }

    @Transactional
    public CamionResponseDTO createCamion(CamionRequestDTO request) {
        Camion camion = new Camion();
        camion.setPlaca(request.getPlaca().trim().toUpperCase());
        camion.setModelo(request.getModelo() != null ? request.getModelo().trim() : null);
        camion.setAnio(request.getAnio());
        camion.setColor(request.getColor() != null ? request.getColor().trim() : null);
        camion.setEstado(request.getEstado());
        camion.setFechaRegistro(LocalDateTime.now());

        if (request.getZonaId() != null) {
            Zona zona = zonaRepository.findById(request.getZonaId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Zona no encontrada"));
            camion.setZona(zona);
        }

        if (request.getOperadorId() != null) {
            Operador operador = operadorRepository.findById(request.getOperadorId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Operador no encontrado"));
            camion.setOperador(operador);
        }

        Camion saved = camionRepository.save(camion);
        return toResponseDTO(saved);
    }

    @Transactional
    public CamionResponseDTO updateCamion(Long id, CamionRequestDTO request) {
        Camion camion = camionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Camión no encontrado"));

        camion.setPlaca(request.getPlaca().trim().toUpperCase());
        camion.setModelo(request.getModelo() != null ? request.getModelo().trim() : null);
        camion.setAnio(request.getAnio());
        camion.setColor(request.getColor() != null ? request.getColor().trim() : null);
        camion.setEstado(request.getEstado());

        if (request.getZonaId() != null) {
            Zona zona = zonaRepository.findById(request.getZonaId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Zona no encontrada"));
            camion.setZona(zona);
        } else {
            camion.setZona(null);
        }

        if (request.getOperadorId() != null) {
            Operador operador = operadorRepository.findById(request.getOperadorId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Operador no encontrado"));
            camion.setOperador(operador);
        } else {
            camion.setOperador(null);
        }

        Camion saved = camionRepository.save(camion);
        return toResponseDTO(saved);
    }

    @Transactional
    public void deleteCamion(Long id) {
        Camion camion = camionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Camión no encontrado"));
        camionRepository.delete(camion);
    }

    public CamionResponseDTO toResponseDTO(Camion c) {
        CamionResponseDTO dto = new CamionResponseDTO();
        dto.setId(c.getId());
        dto.setPlaca(c.getPlaca());
        dto.setModelo(c.getModelo());
        dto.setAnio(c.getAnio());
        dto.setColor(c.getColor());
        dto.setEstado(c.getEstado());
        dto.setFechaRegistro(c.getFechaRegistro());

        if (c.getZona() != null) {
            dto.setZonaId(c.getZona().getId());
            dto.setZonaNombre(c.getZona().getNombre());
        }

        if (c.getOperador() != null) {
            dto.setOperadorId(c.getOperador().getId());
            dto.setOperadorNombre(c.getOperador().getNombre() + " " + c.getOperador().getApellido());
        }

        return dto;
    }
}
