package com.igcsscz.backend.modules.auth;

import com.igcsscz.backend.config.JwtService;
import com.igcsscz.backend.modules.auth.dto.AuthResponse;
import com.igcsscz.backend.modules.auth.dto.LoginRequest;
import com.igcsscz.backend.modules.auth.dto.RegisterRequest;
import com.igcsscz.backend.modules.operador.Operador;
import com.igcsscz.backend.modules.usuario.RolEnum;
import com.igcsscz.backend.modules.usuario.Usuario;
import com.igcsscz.backend.modules.usuario.UsuarioRepository;
import com.igcsscz.backend.modules.vecino.Vecino;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El email ya está registrado");
        }
        if (request.getRol() == RolEnum.ADMINISTRADOR) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "No se permite el registro público como administrador");
        }

        String email = request.getEmail().trim().toLowerCase();
        String hash = passwordEncoder.encode(request.getPassword());
        LocalDateTime now = LocalDateTime.now();

        Usuario usuario =
                switch (request.getRol()) {
                    case OPERADOR -> buildOperador(request, email, hash, now);
                    case VECINO -> buildVecino(request, email, hash, now);
                    default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol no soportado");
                };

        usuarioRepository.save(usuario);
        return toAuthResponse(usuario);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Usuario usuario =
                usuarioRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));

        if (!usuario.isActivo()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario inactivo");
        }
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
        }

        return toAuthResponse(usuario);
    }

    private Operador buildOperador(RegisterRequest request, String email, String hash, LocalDateTime now) {
        Operador o = new Operador();
        o.setNombre(request.getNombre().trim());
        o.setApellido(request.getApellido().trim());
        o.setEmail(email);
        o.setPassword(hash);
        o.setTelefono(trimOrNull(request.getTelefono()));
        o.setRol(RolEnum.OPERADOR);
        o.setActivo(true);
        o.setFechaCreacion(now);
        o.setLicencia(null);
        o.setTurno(null);
        return o;
    }

    private Vecino buildVecino(RegisterRequest request, String email, String hash, LocalDateTime now) {
        Vecino v = new Vecino();
        v.setNombre(request.getNombre().trim());
        v.setApellido(request.getApellido().trim());
        v.setEmail(email);
        v.setPassword(hash);
        v.setTelefono(trimOrNull(request.getTelefono()));
        v.setRol(RolEnum.VECINO);
        v.setActivo(true);
        v.setFechaCreacion(now);
        v.setDireccion("");
        v.setLatitud(null);
        v.setLongitud(null);
        v.setCodigoQR("QR-VEC-" + email);
        v.setPuntosAcumulados(0);
        v.setFechaRegistro(now);
        v.setZona(null);
        return v;
    }

    private static String trimOrNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }

    private AuthResponse toAuthResponse(Usuario usuario) {
        String token = jwtService.generateToken(usuario);
        return new AuthResponse(token, usuario.getEmail(), usuario.getRol(), usuario.getNombre());
    }
}
