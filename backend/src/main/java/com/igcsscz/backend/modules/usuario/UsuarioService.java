package com.igcsscz.backend.modules.usuario;

import com.igcsscz.backend.modules.operador.Operador;
import com.igcsscz.backend.modules.usuario.dto.UsuarioRequestDTO;
import com.igcsscz.backend.modules.usuario.dto.UsuarioResponseDTO;
import com.igcsscz.backend.modules.vecino.Vecino;
import com.igcsscz.backend.modules.zona.Zona;
import com.igcsscz.backend.modules.zona.ZonaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final ZonaRepository zonaRepository;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            ZonaRepository zonaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.zonaRepository = zonaRepository;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> getAllUsers() {
        return usuarioRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO getUserById(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        return toResponseDTO(usuario);
    }

    @Transactional
    public UsuarioResponseDTO createUser(UsuarioRequestDTO request) {
        if (usuarioRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El email ya está registrado");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña es obligatoria");
        }

        String email = request.getEmail().trim().toLowerCase();
        String hash = passwordEncoder.encode(request.getPassword());
        LocalDateTime now = LocalDateTime.now();

        Usuario usuario = switch (request.getRol()) {
            case ADMINISTRADOR -> {
                Administrador admin = new Administrador();
                populateCommonFields(admin, request, email, hash, now);
                yield admin;
            }
            case OPERADOR -> {
                Operador op = new Operador();
                populateCommonFields(op, request, email, hash, now);
                op.setLicencia(trimOrNull(request.getLicencia()));
                op.setTurno(trimOrNull(request.getTurno()));
                yield op;
            }
            case VECINO -> {
                Vecino vec = new Vecino();
                populateCommonFields(vec, request, email, hash, now);
                vec.setDireccion(request.getDireccion() != null ? request.getDireccion().trim() : "");
                vec.setLatitud(request.getLatitud());
                vec.setLongitud(request.getLongitud());
                vec.setCodigoQR("QR-VEC-" + email);
                vec.setPuntosAcumulados(0);
                vec.setFechaRegistro(now);
                if (request.getZonaId() != null) {
                    Zona zona = zonaRepository.findById(request.getZonaId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "La zona especificada no existe"));
                    vec.setZona(zona);
                }
                yield vec;
            }
        };

        Usuario saved = usuarioRepository.save(usuario);
        return toResponseDTO(saved);
    }

    @Transactional
    public UsuarioResponseDTO updateUser(Long id, UsuarioRequestDTO request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        String email = request.getEmail().trim().toLowerCase();
        if (!usuario.getEmail().equalsIgnoreCase(email) && usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El email ya está registrado por otro usuario");
        }

        usuario.setEmail(email);
        usuario.setNombre(request.getNombre().trim());
        usuario.setApellido(request.getApellido().trim());
        usuario.setTelefono(trimOrNull(request.getTelefono()));
        
        if (request.getActivo() != null) {
            usuario.setActivo(request.getActivo());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Si cambia de rol, no se permite cambiar dinámicamente la clase base polimórfica en JPA directo
        // por restricciones de Hibernate single-table, por lo que asumimos que el rol no cambia una vez creado
        // o si es del mismo tipo actualizamos los campos específicos de rol.
        if (usuario instanceof Operador op) {
            op.setLicencia(trimOrNull(request.getLicencia()));
            op.setTurno(trimOrNull(request.getTurno()));
        } else if (usuario instanceof Vecino vec) {
            vec.setDireccion(request.getDireccion() != null ? request.getDireccion().trim() : "");
            vec.setLatitud(request.getLatitud());
            vec.setLongitud(request.getLongitud());
            if (request.getZonaId() != null) {
                Zona zona = zonaRepository.findById(request.getZonaId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "La zona especificada no existe"));
                vec.setZona(zona);
            } else {
                vec.setZona(null);
            }
        }

        Usuario saved = usuarioRepository.save(usuario);
        return toResponseDTO(saved);
    }

    @Transactional
    public void deleteUser(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        usuarioRepository.delete(usuario);
    }

    @Transactional
    public UsuarioResponseDTO toggleActive(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        usuario.setActivo(!usuario.isActivo());
        Usuario saved = usuarioRepository.save(usuario);
        return toResponseDTO(saved);
    }

    private void populateCommonFields(Usuario u, UsuarioRequestDTO r, String email, String hash, LocalDateTime now) {
        u.setEmail(email);
        u.setPassword(hash);
        u.setNombre(r.getNombre().trim());
        u.setApellido(r.getApellido().trim());
        u.setTelefono(trimOrNull(r.getTelefono()));
        u.setRol(r.getRol());
        u.setActivo(r.getActivo() != null ? r.getActivo() : true);
        u.setFechaCreacion(now);
    }

    private String trimOrNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    public UsuarioResponseDTO toResponseDTO(Usuario u) {
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setId(u.getId());
        dto.setEmail(u.getEmail());
        dto.setNombre(u.getNombre());
        dto.setApellido(u.getApellido());
        dto.setTelefono(u.getTelefono());
        dto.setRol(u.getRol());
        dto.setActivo(u.isActivo());
        dto.setFechaCreacion(u.getFechaCreacion());

        if (u instanceof Operador op) {
            dto.setLicencia(op.getLicencia());
            dto.setTurno(op.getTurno());
        } else if (u instanceof Vecino vec) {
            dto.setDireccion(vec.getDireccion());
            dto.setLatitud(vec.getLatitud());
            dto.setLongitud(vec.getLongitud());
            dto.setCodigoQR(vec.getCodigoQR());
            dto.setPuntosAcumulados(vec.getPuntosAcumulados());
            if (vec.getZona() != null) {
                dto.setZonaId(vec.getZona().getId());
                dto.setZonaNombre(vec.getZona().getNombre());
            }
        }
        return dto;
    }
}
