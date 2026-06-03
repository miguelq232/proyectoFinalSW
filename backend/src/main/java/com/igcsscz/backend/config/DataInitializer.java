package com.igcsscz.backend.config;

import com.igcsscz.backend.modules.camion.Camion;
import com.igcsscz.backend.modules.camion.CamionRepository;
import com.igcsscz.backend.modules.camion.EstadoCamionEnum;
import com.igcsscz.backend.modules.operador.Operador;
import com.igcsscz.backend.modules.usuario.Administrador;
import com.igcsscz.backend.modules.usuario.RolEnum;
import com.igcsscz.backend.modules.usuario.UsuarioRepository;
import com.igcsscz.backend.modules.vecino.Vecino;
import com.igcsscz.backend.modules.zona.Zona;
import com.igcsscz.backend.modules.zona.ZonaRepository;
import java.time.LocalDateTime;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final String DEFAULT_PASSWORD = "admin123";

    private final ZonaRepository zonaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CamionRepository camionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            ZonaRepository zonaRepository,
            UsuarioRepository usuarioRepository,
            CamionRepository camionRepository,
            PasswordEncoder passwordEncoder) {
        this.zonaRepository = zonaRepository;
        this.usuarioRepository = usuarioRepository;
        this.camionRepository = camionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (zonaRepository.count() > 0 || usuarioRepository.count() > 0 || camionRepository.count() > 0) {
            System.out.println("DataInitializer: la base de datos ya contiene datos, se omite la carga inicial.");
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        String encodedPassword = passwordEncoder.encode(DEFAULT_PASSWORD);

        // --- ZONAS ---
        Zona zonaNorte = saveZona(
                "Distrito Norte - Plan 3000",
                "Zona norte de la ciudad",
                -17.7234,
                -63.1521,
                3.5,
                true);
        Zona zonaCentro = saveZona(
                "Distrito Centro - Equipetrol",
                "Zona céntrica de la ciudad",
                -17.7834,
                -63.1821,
                2.5,
                true);
        Zona zonaSur = saveZona(
                "Distrito Sur - Villa 1ro de Mayo",
                "Zona sur de la ciudad",
                -17.8234,
                -63.1621,
                4.0,
                true);

        // --- USUARIOS ---
        saveAdministrador("Admin", "IGCS SCZ", "admin@igcsscz.com", "00000000", encodedPassword, now);

        Operador operadorNorte = saveOperador(
                "Juan",
                "López",
                "operador.juan@igcsscz.com",
                "+591 70000002",
                "Categoría T - Profesional",
                "Mañana",
                encodedPassword,
                now);
        Operador operadorCentro = saveOperador(
                "Pedro",
                "Vargas",
                "operador.pedro@igcsscz.com",
                "+591 70000004",
                "Categoría B",
                "Tarde",
                encodedPassword,
                now);
        Operador operadorSur = saveOperador(
                "Carlos",
                "Méndez",
                "operador.sur@igcsscz.com",
                "+591 70000005",
                "Categoría C",
                "Noche",
                encodedPassword,
                now);

        saveVecino(
                "Ana",
                "Suárez",
                "vecino.ana@correo.com",
                "+591 70000003",
                "Av. Banzer 4to Anillo",
                -17.7234,
                -63.1521,
                zonaNorte,
                150,
                encodedPassword,
                now);
        saveVecino(
                "María",
                "Ríos",
                "vecino.centro@correo.com",
                "+591 70000006",
                "Av. San Martín, Equipetrol",
                -17.7834,
                -63.1821,
                zonaCentro,
                80,
                encodedPassword,
                now);
        saveVecino(
                "Luis",
                "Torrez",
                "vecino.sur@correo.com",
                "+591 70000007",
                "Villa 1ro de Mayo, Calle 8",
                -17.8234,
                -63.1621,
                zonaSur,
                120,
                encodedPassword,
                now);

        // --- CAMIONES ---
        saveCamion("3456-LPA", "Nissan Condor", 2021, "Verde", EstadoCamionEnum.ACTIVO, zonaNorte, operadorNorte, now);
        saveCamion("8823-XCA", "Volvo FMX", 2024, "Blanco", EstadoCamionEnum.ACTIVO, zonaCentro, operadorCentro, now);
        saveCamion("9012-KHB", "Mercedes Atego", 2022, "Verde", EstadoCamionEnum.ACTIVO, zonaSur, operadorSur, now);

        System.out.println("DataInitializer: datos de demostración insertados correctamente.");
        System.out.println("Credenciales de prueba (todos los roles): password = " + DEFAULT_PASSWORD);
    }

    private Zona saveZona(
            String nombre,
            String descripcion,
            double latitudCentro,
            double longitudCentro,
            double radioKm,
            boolean activa) {
        Zona zona = new Zona();
        zona.setNombre(nombre);
        zona.setDescripcion(descripcion);
        zona.setLatitudCentro(latitudCentro);
        zona.setLongitudCentro(longitudCentro);
        zona.setRadioKm(radioKm);
        zona.setActiva(activa);
        return zonaRepository.save(zona);
    }

    private void saveAdministrador(
            String nombre,
            String apellido,
            String email,
            String telefono,
            String encodedPassword,
            LocalDateTime now) {
        Administrador admin = new Administrador();
        admin.setNombre(nombre);
        admin.setApellido(apellido);
        admin.setEmail(email.trim().toLowerCase());
        admin.setPassword(encodedPassword);
        admin.setTelefono(telefono);
        admin.setRol(RolEnum.ADMINISTRADOR);
        admin.setActivo(true);
        admin.setFechaCreacion(now);
        usuarioRepository.save(admin);
    }

    private Operador saveOperador(
            String nombre,
            String apellido,
            String email,
            String telefono,
            String licencia,
            String turno,
            String encodedPassword,
            LocalDateTime now) {
        Operador operador = new Operador();
        operador.setNombre(nombre);
        operador.setApellido(apellido);
        operador.setEmail(email.trim().toLowerCase());
        operador.setPassword(encodedPassword);
        operador.setTelefono(telefono);
        operador.setRol(RolEnum.OPERADOR);
        operador.setActivo(true);
        operador.setFechaCreacion(now);
        operador.setLicencia(licencia);
        operador.setTurno(turno);
        return (Operador) usuarioRepository.save(operador);
    }

    private void saveVecino(
            String nombre,
            String apellido,
            String email,
            String telefono,
            String direccion,
            double latitud,
            double longitud,
            Zona zona,
            int puntosAcumulados,
            String encodedPassword,
            LocalDateTime now) {
        Vecino vecino = new Vecino();
        vecino.setNombre(nombre);
        vecino.setApellido(apellido);
        vecino.setEmail(email.trim().toLowerCase());
        vecino.setPassword(encodedPassword);
        vecino.setTelefono(telefono);
        vecino.setRol(RolEnum.VECINO);
        vecino.setActivo(true);
        vecino.setFechaCreacion(now);
        vecino.setDireccion(direccion);
        vecino.setLatitud(latitud);
        vecino.setLongitud(longitud);
        vecino.setCodigoQR("QR-VEC-" + email.trim().toLowerCase());
        vecino.setPuntosAcumulados(puntosAcumulados);
        vecino.setFechaRegistro(now);
        vecino.setZona(zona);
        usuarioRepository.save(vecino);
    }

    private void saveCamion(
            String placa,
            String modelo,
            int anio,
            String color,
            EstadoCamionEnum estado,
            Zona zona,
            Operador operador,
            LocalDateTime now) {
        Camion camion = new Camion();
        camion.setPlaca(placa);
        camion.setModelo(modelo);
        camion.setAnio(anio);
        camion.setColor(color);
        camion.setEstado(estado);
        camion.setFechaRegistro(now);
        camion.setZona(zona);
        camion.setOperador(operador);
        camionRepository.save(camion);
    }
}
