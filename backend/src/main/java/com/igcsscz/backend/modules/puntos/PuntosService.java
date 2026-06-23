package com.igcsscz.backend.modules.puntos;

import com.igcsscz.backend.modules.config.ConfigPuntosService;
import com.igcsscz.backend.modules.puntos.dto.PuntosRequestDTO;
import com.igcsscz.backend.modules.puntos.dto.PuntosResponseDTO;
import com.igcsscz.backend.modules.puntos.dto.RegistrarReciclajeRequestDTO;
import com.igcsscz.backend.modules.puntos.dto.RegistrarReciclajeResponseDTO;
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
    private final ConfigPuntosService configPuntosService;

    public PuntosService(
            PuntosRepository puntosRepository,
            VecinoRepository vecinoRepository,
            ConfigPuntosService configPuntosService) {
        this.puntosRepository = puntosRepository;
        this.vecinoRepository = vecinoRepository;
        this.configPuntosService = configPuntosService;
    }

    @Transactional
    public PuntosResponseDTO registrarDeposito(PuntosRequestDTO request) {
        if (request.getCodigoQR() == null || request.getCodigoQR().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El codigo QR es obligatorio");
        }

        Vecino vecino =
                vecinoRepository
                        .findByCodigoQR(request.getCodigoQR().trim())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vecino no encontrado"));

        int puntosOtorgados =
                configPuntosService.calcularPuntos(
                        request.getTipoResiduo(), request.getCantidad(), request.getPesoKg());

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

    @Transactional
    public RegistrarReciclajeResponseDTO registrarReciclaje(RegistrarReciclajeRequestDTO request) {
        if (request.getCodigoCliente() == null || request.getCodigoCliente().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El codigo de cliente es obligatorio");
        }

        String codigo = request.getCodigoCliente().trim();
        Vecino vecino =
                vecinoRepository
                        .findByCodigoQR(codigo)
                        .or(
                                () -> {
                                    if (codigo.startsWith("VEC-") && codigo.endsWith("-IGCS")) {
                                        try {
                                            String idPart = codigo.substring(4, codigo.length() - 5);
                                            Long id = Long.parseLong(idPart);
                                            return vecinoRepository.findById(id);
                                        } catch (NumberFormatException e) {
                                            // ignore
                                        }
                                    }
                                    try {
                                        Long id = Long.parseLong(codigo);
                                        return vecinoRepository.findById(id);
                                    } catch (NumberFormatException e) {
                                        return java.util.Optional.empty();
                                    }
                                })
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Vecino no encontrado con codigo/QR: " + codigo));

        int puntosOtorgados = request.getPuntos() != null ? request.getPuntos() : 0;

        if (puntosOtorgados > 0) {
            int actuales = vecino.getPuntosAcumulados() != null ? vecino.getPuntosAcumulados() : 0;
            vecino.setPuntosAcumulados(actuales + puntosOtorgados);
            vecinoRepository.save(vecino);
        }

        Puntos registro = new Puntos();
        registro.setVecino(vecino);
        registro.setTipoResiduo(request.getClasificacion() != null ? request.getClasificacion().toUpperCase() : "NADA");
        registro.setCantidad(1.0);
        registro.setPuntosOtorgados(puntosOtorgados);
        registro.setFecha(LocalDateTime.now());
        registro.setDescripcion(null);

        puntosRepository.save(registro);

        return new RegistrarReciclajeResponseDTO(
                vecino.getPuntosAcumulados(), vecino.getNombre() + " " + vecino.getApellido());
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
