package com.igcsscz.backend.config;

import com.igcsscz.backend.modules.usuario.Administrador;
import com.igcsscz.backend.modules.usuario.RolEnum;
import com.igcsscz.backend.modules.usuario.UsuarioRepository;
import java.time.LocalDateTime;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "admin@igcsscz.com";

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.existsByRol(RolEnum.ADMINISTRADOR)) {
            System.out.println("Admin ya existe");
            return;
        }

        Administrador admin = new Administrador();
        admin.setNombre("Admin");
        admin.setApellido("IGCS SCZ");
        admin.setEmail(ADMIN_EMAIL);
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setTelefono("00000000");
        admin.setRol(RolEnum.ADMINISTRADOR);
        admin.setActivo(true);
        admin.setFechaCreacion(LocalDateTime.now());

        usuarioRepository.save(admin);
        System.out.println("Admin creado: admin@igcsscz.com");
    }
}
