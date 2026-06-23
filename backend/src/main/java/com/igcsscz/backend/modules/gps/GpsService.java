package com.igcsscz.backend.modules.gps;

import com.igcsscz.backend.modules.camion.Camion;
import com.igcsscz.backend.modules.camion.CamionRepository;
import com.igcsscz.backend.modules.gps.dto.CamionUbicacionDTO;
import com.igcsscz.backend.modules.gps.dto.CercaniaResponseDTO;
import com.igcsscz.backend.modules.gps.dto.UbicacionRequestDTO;
import com.igcsscz.backend.modules.usuario.Usuario;
import com.igcsscz.backend.modules.usuario.UsuarioRepository;
import com.igcsscz.backend.modules.vecino.Vecino;
import com.igcsscz.backend.modules.vecino.VecinoRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GpsService {

    private final CamionRepository camionRepository;
    private final VecinoRepository vecinoRepository;

    // Estructura de almacenamiento concurrente en memoria
    private static class CoordenadasLive {
        double latitud;
        double longitud;
        LocalDateTime timestamp;

        CoordenadasLive(double latitud, double longitud, LocalDateTime timestamp) {
            this.latitud = latitud;
            this.longitud = longitud;
            this.timestamp = timestamp;
        }
    }

    private final ConcurrentHashMap<Long, CoordenadasLive> ubicacionesVivas = new ConcurrentHashMap<>();

    public GpsService(CamionRepository camionRepository, VecinoRepository vecinoRepository) {
        this.camionRepository = camionRepository;
        this.vecinoRepository = vecinoRepository;
    }

    public void actualizarUbicacion(UbicacionRequestDTO request) {
        Camion camion = camionRepository.findById(request.getCamionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehículo no registrado"));

        ubicacionesVivas.put(
                request.getCamionId(),
                new CoordenadasLive(request.getLatitud(), request.getLongitud(), LocalDateTime.now())
        );
    }

    @Transactional
    public List<CamionUbicacionDTO> obtenerUbicacionesVivas() {
        List<CamionUbicacionDTO> lista = new ArrayList<>();
        List<Camion> camiones = camionRepository.findAll();

        for (Camion c : camiones) {
            CoordenadasLive coord = ubicacionesVivas.get(c.getId());
            if (coord != null) {
                lista.add(mapToUbicacionDTO(c, coord));
            }
        }
        return lista;
    }

    @Transactional
    public List<CamionUbicacionDTO> obtenerUbicacionesPorZona(Long zonaId) {
        List<CamionUbicacionDTO> lista = new ArrayList<>();
        List<Camion> camiones = camionRepository.findAll();

        for (Camion c : camiones) {
            if (c.getZona() != null && c.getZona().getId().equals(zonaId)) {
                CoordenadasLive coord = ubicacionesVivas.get(c.getId());
                if (coord != null) {
                    lista.add(mapToUbicacionDTO(c, coord));
                }
            }
        }
        return lista;
    }

    @Transactional
    public List<CamionUbicacionDTO> obtenerUbicacionesParaVecino(String email) {
        Vecino vecino = buscarVecinoPorEmail(email);

        if (vecino.getLatitud() == null || vecino.getLongitud() == null) {
            return List.of();
        }

        List<CamionUbicacionDTO> lista = new ArrayList<>();
        List<Camion> camiones = camionRepository.findAll();

        for (Camion c : camiones) {
            CoordenadasLive coord = ubicacionesVivas.get(c.getId());
            if (coord != null && camionEsVisibleParaVecino(c, vecino)) {
                lista.add(mapToUbicacionDTO(c, coord));
            }
        }

        return lista;
    }

    @Transactional
    public CercaniaResponseDTO calcularCercaniaVecino(String email) {
        Vecino vecino = buscarVecinoPorEmail(email);

        if (vecino.getLatitud() == null || vecino.getLongitud() == null) {
            return new CercaniaResponseDTO(false, null, null, null, null);
        }

        List<CamionUbicacionDTO> camionesEnZona = obtenerUbicacionesParaVecino(email);

        if (camionesEnZona.isEmpty()) {
            return new CercaniaResponseDTO(false, null, null, null, null);
        }

        CamionUbicacionDTO masCercano = null;
        double menorDistancia = Double.MAX_VALUE;

        for (CamionUbicacionDTO c : camionesEnZona) {
            double dist = calcularHaversine(
                    vecino.getLatitud(), vecino.getLongitud(),
                    c.getLatitud(), c.getLongitud()
            );
            if (dist < menorDistancia) {
                menorDistancia = dist;
                masCercano = c;
            }
        }

        if (masCercano != null) {
            // Umbral de 500 metros para alertar proximidad
            boolean cerca = menorDistancia <= 500.0;
            return new CercaniaResponseDTO(
                    cerca,
                    menorDistancia,
                    masCercano.getPlaca(),
                    masCercano.getCamionId(),
                    masCercano.getOperadorNombre()
            );
        }

        return new CercaniaResponseDTO(false, null, null, null, null);
    }

    private Vecino buscarVecinoPorEmail(String email) {
        return vecinoRepository.findAll().stream()
                .filter(v -> v.getEmail().equalsIgnoreCase(email.trim()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vecino no encontrado"));
    }

    @Transactional
    public Double calcularDistanciaCamionVecino(Long camionId, String email) {
        Vecino vecino = buscarVecinoPorEmail(email);
        CoordenadasLive coord = ubicacionesVivas.get(camionId);

        if (vecino.getLatitud() == null || vecino.getLongitud() == null || coord == null) {
            return null;
        }

        return calcularHaversine(vecino.getLatitud(), vecino.getLongitud(), coord.latitud, coord.longitud);
    }

    private boolean camionEsVisibleParaVecino(Camion camion, Vecino vecino) {
        if (camion.getZona() == null) {
            return false;
        }

        if (vecino.getZona() != null && camion.getZona().getId().equals(vecino.getZona().getId())) {
            return true;
        }

        if (camion.getZona().getLatitudCentro() == null ||
                camion.getZona().getLongitudCentro() == null ||
                camion.getZona().getRadioKm() == null) {
            return false;
        }

        double distanciaAlCentro = calcularHaversine(
                vecino.getLatitud(), vecino.getLongitud(),
                camion.getZona().getLatitudCentro(), camion.getZona().getLongitudCentro()
        );

        return distanciaAlCentro <= camion.getZona().getRadioKm() * 1000.0;
    }

    private double calcularHaversine(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371000.0; // Radio de la Tierra en metros
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private CamionUbicacionDTO mapToUbicacionDTO(Camion c, CoordenadasLive coord) {
        CamionUbicacionDTO dto = new CamionUbicacionDTO();
        dto.setCamionId(c.getId());
        dto.setPlaca(c.getPlaca());
        dto.setModelo(c.getModelo());
        dto.setEstado(c.getEstado().name());
        
        if (c.getOperador() != null) {
            dto.setOperadorNombre(c.getOperador().getNombre() + " " + c.getOperador().getApellido());
        } else {
            dto.setOperadorNombre("Sin Asignar");
        }

        if (c.getZona() != null) {
            dto.setZonaId(c.getZona().getId());
            dto.setZonaNombre(c.getZona().getNombre());
        }

        dto.setLatitud(coord.latitud);
        dto.setLongitud(coord.longitud);
        dto.setUltimaActualizacion(coord.timestamp);

        return dto;
    }
}
