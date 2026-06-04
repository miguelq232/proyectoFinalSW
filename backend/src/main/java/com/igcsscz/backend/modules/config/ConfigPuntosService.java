package com.igcsscz.backend.modules.config;

import com.igcsscz.backend.modules.config.dto.ConfigPuntosRequestDTO;
import com.igcsscz.backend.modules.config.dto.ConfigPuntosResponseDTO;
import com.igcsscz.backend.modules.usuario.RolEnum;
import com.igcsscz.backend.modules.usuario.UsuarioRepository;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ConfigPuntosService {

    private static final Set<String> MODOS_VALIDOS = Set.of("UNIDAD", "PESO", "AMBOS");

    private final ConfigPuntosRepository configPuntosRepository;
    private final UsuarioRepository usuarioRepository;

    public ConfigPuntosService(
            ConfigPuntosRepository configPuntosRepository, UsuarioRepository usuarioRepository) {
        this.configPuntosRepository = configPuntosRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<ConfigPuntosResponseDTO> getAll() {
        return configPuntosRepository.findAll().stream().map(this::toResponseDTO).toList();
    }

    @Transactional(readOnly = true)
    public ConfigPuntosResponseDTO getByCategoria(String categoria) {
        String normalizada = normalizarCategoria(categoria);
        ConfigPuntos config = configPuntosRepository
                .findByCategoria(normalizada)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Configuración no encontrada para categoría: " + normalizada));
        return toResponseDTO(config);
    }

    @Transactional
    public ConfigPuntosResponseDTO update(Long id, ConfigPuntosRequestDTO request, String emailSolicitante) {
        requireAdministrador(emailSolicitante);
        validarModoCalculo(request.getModoCalculo());

        ConfigPuntos config = configPuntosRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Configuración no encontrada"));

        config.setPuntosUnidad(request.getPuntosUnidad());
        config.setPuntosKg(request.getPuntosKg());
        config.setModoCalculo(request.getModoCalculo().trim().toUpperCase());
        config.setActivo(request.getActivo());
        config.setPrecioBsKg(request.getPrecioBsKg());
        config.setMetaMensualKg(request.getMetaMensualKg());

        return toResponseDTO(configPuntosRepository.save(config));
    }

    @Transactional(readOnly = true)
    public int calcularPuntos(String categoria, Double cantidad, Double pesoKg) {
        if (categoria == null || categoria.isBlank()) {
            return 0;
        }

        ConfigPuntos config = configPuntosRepository
                .findByCategoria(normalizarCategoria(categoria))
                .orElse(null);

        if (config == null || !Boolean.TRUE.equals(config.getActivo())) {
            return 0;
        }

        String modo = config.getModoCalculo() != null ? config.getModoCalculo().trim().toUpperCase() : "";
        double unidades = cantidad != null && cantidad > 0 ? cantidad : 1.0;
        double kg = pesoKg != null && pesoKg > 0 ? pesoKg : 0.0;

        int puntosUnidad = config.getPuntosUnidad() != null ? config.getPuntosUnidad() : 0;
        double puntosKgRate = config.getPuntosKg() != null ? config.getPuntosKg() : 0.0;

        double puntos =
                switch (modo) {
                    case "UNIDAD" -> puntosUnidad * unidades;
                    case "PESO" -> {
                        if (kg <= 0) {
                            yield 0;
                        }
                        yield puntosKgRate * kg;
                    }
                    case "AMBOS" -> {
                        double porUnidad = puntosUnidad * unidades;
                        double porPeso = kg > 0 ? puntosKgRate * kg : 0;
                        yield porUnidad + porPeso;
                    }
                    default -> 0;
                };

        return (int) Math.round(puntos);
    }

    private void requireAdministrador(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo administradores pueden actualizar la configuración");
        }
        usuarioRepository
                .findByEmail(email.trim().toLowerCase())
                .filter(u -> u.getRol() == RolEnum.ADMINISTRADOR)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "Solo administradores pueden actualizar la configuración"));
    }

    private void validarModoCalculo(String modoCalculo) {
        if (modoCalculo == null || !MODOS_VALIDOS.contains(modoCalculo.trim().toUpperCase())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "modoCalculo debe ser UNIDAD, PESO o AMBOS");
        }
    }

    private String normalizarCategoria(String categoria) {
        return categoria.trim().toUpperCase();
    }

    private ConfigPuntosResponseDTO toResponseDTO(ConfigPuntos config) {
        return new ConfigPuntosResponseDTO(
                config.getId(),
                config.getCategoria(),
                config.getPuntosUnidad(),
                config.getPuntosKg(),
                config.getModoCalculo(),
                config.getActivo(),
                config.getPrecioBsKg(),
                config.getMetaMensualKg());
    }
}
