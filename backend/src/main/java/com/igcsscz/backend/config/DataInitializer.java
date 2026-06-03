package com.igcsscz.backend.config;

import com.igcsscz.backend.modules.camion.Camion;
import com.igcsscz.backend.modules.camion.CamionRepository;
import com.igcsscz.backend.modules.camion.EstadoCamionEnum;
import com.igcsscz.backend.modules.config.ConfigPuntos;
import com.igcsscz.backend.modules.config.ConfigPuntosRepository;
import com.igcsscz.backend.modules.config.ConfigPuntosService;
import com.igcsscz.backend.modules.operador.Operador;
import com.igcsscz.backend.modules.puntos.Puntos;
import com.igcsscz.backend.modules.puntos.PuntosRepository;
import com.igcsscz.backend.modules.usuario.Administrador;
import com.igcsscz.backend.modules.usuario.RolEnum;
import com.igcsscz.backend.modules.usuario.UsuarioRepository;
import com.igcsscz.backend.modules.vecino.Vecino;
import com.igcsscz.backend.modules.vecino.VecinoRepository;
import com.igcsscz.backend.modules.zona.Zona;
import com.igcsscz.backend.modules.zona.ZonaRepository;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final String DEFAULT_PASSWORD = "admin123";

    private static final String[] TIPOS_RESIDUO = {"GLASS", "METAL", "PAPER", "PET", "PLASTIC"};

    private final Random random = new Random();

    private final ZonaRepository zonaRepository;
    private final UsuarioRepository usuarioRepository;
    private final VecinoRepository vecinoRepository;
    private final CamionRepository camionRepository;
    private final PuntosRepository puntosRepository;
    private final ConfigPuntosRepository configPuntosRepository;
    private final ConfigPuntosService configPuntosService;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            ZonaRepository zonaRepository,
            UsuarioRepository usuarioRepository,
            VecinoRepository vecinoRepository,
            CamionRepository camionRepository,
            PuntosRepository puntosRepository,
            ConfigPuntosRepository configPuntosRepository,
            ConfigPuntosService configPuntosService,
            PasswordEncoder passwordEncoder) {
        this.zonaRepository = zonaRepository;
        this.usuarioRepository = usuarioRepository;
        this.vecinoRepository = vecinoRepository;
        this.camionRepository = camionRepository;
        this.puntosRepository = puntosRepository;
        this.configPuntosRepository = configPuntosRepository;
        this.configPuntosService = configPuntosService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        LocalDateTime now = LocalDateTime.now();
        String encodedPassword = passwordEncoder.encode(DEFAULT_PASSWORD);

        if (configPuntosRepository.count() == 0) {
            inicializarConfigPuntos();
            System.out.println("DataInitializer: configuración de puntos por categoría insertada.");
        }

        if (zonaRepository.count() == 0 && usuarioRepository.count() == 0 && camionRepository.count() == 0) {
            inicializarDatosBase(encodedPassword, now);
            System.out.println("DataInitializer: datos de demostración insertados correctamente.");
            System.out.println("Credenciales de prueba (todos los roles): password = " + DEFAULT_PASSWORD);
        }

        if (zonaRepository.count() > 0 && camionRepository.count() > 0) {
            if (usuarioRepository.count() < 5 || faltanVecinosAdicionales()) {
                agregarVecinosAdicionales(encodedPassword, now);
            }
            if (puntosRepository.count() == 0) {
                agregarPuntosPrueba(now);
            }
        }
    }

    private boolean faltanVecinosAdicionales() {
        String[] emails = {
            "sofia@correo.com",
            "diego@correo.com",
            "carmen@correo.com",
            "roberto@correo.com",
            "patricia@correo.com",
            "jorge@correo.com",
            "laura@correo.com"
        };
        for (String email : emails) {
            if (!usuarioRepository.existsByEmail(email)) {
                return true;
            }
        }
        return false;
    }

    private void inicializarDatosBase(String encodedPassword, LocalDateTime now) {
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

        saveCamion("3456-LPA", "Nissan Condor", 2021, "Verde", EstadoCamionEnum.ACTIVO, zonaNorte, operadorNorte, now);
        saveCamion("8823-XCA", "Volvo FMX", 2024, "Blanco", EstadoCamionEnum.ACTIVO, zonaCentro, operadorCentro, now);
        saveCamion("9012-KHB", "Mercedes Atego", 2022, "Verde", EstadoCamionEnum.ACTIVO, zonaSur, operadorSur, now);
    }

    private void agregarVecinosAdicionales(String encodedPassword, LocalDateTime now) {
        agregarVecinoSiNoExiste(
                "Sofia",
                "Roca",
                "sofia@correo.com",
                "+591 70000010",
                "Av. Roca y Coronado",
                -17.7134,
                -63.1421,
                "Distrito Norte",
                0,
                encodedPassword,
                now);
        agregarVecinoSiNoExiste(
                "Diego",
                "Peña",
                "diego@correo.com",
                "+591 70000011",
                "Calle Murillo 2do Anillo",
                -17.7934,
                -63.1921,
                "Distrito Centro",
                0,
                encodedPassword,
                now);
        agregarVecinoSiNoExiste(
                "Carmen",
                "Suarez",
                "carmen@correo.com",
                "+591 70000012",
                "Av. Paragua 4to Anillo",
                -17.7634,
                -63.2021,
                "Distrito Norte",
                0,
                encodedPassword,
                now);
        agregarVecinoSiNoExiste(
                "Roberto",
                "Vaca",
                "roberto@correo.com",
                "+591 70000013",
                "Barrio Las Palmas",
                -17.8034,
                -63.1521,
                "Distrito Sur",
                0,
                encodedPassword,
                now);
        agregarVecinoSiNoExiste(
                "Patricia",
                "Lima",
                "patricia@correo.com",
                "+591 70000014",
                "Av. Banzer 6to Anillo",
                -17.7334,
                -63.1321,
                "Distrito Norte",
                0,
                encodedPassword,
                now);
        agregarVecinoSiNoExiste(
                "Jorge",
                "Montero",
                "jorge@correo.com",
                "+591 70000015",
                "Radial 26 3er Anillo",
                -17.8134,
                -63.1721,
                "Distrito Sur",
                0,
                encodedPassword,
                now);
        agregarVecinoSiNoExiste(
                "Laura",
                "Choque",
                "laura@correo.com",
                "+591 70000016",
                "Villa Olimpica Calle 5",
                -17.7834,
                -63.1621,
                "Distrito Centro",
                0,
                encodedPassword,
                now);
        System.out.println("DataInitializer: vecinos adicionales verificados/insertados.");
    }

    private void agregarVecinoSiNoExiste(
            String nombre,
            String apellido,
            String email,
            String telefono,
            String direccion,
            double latitud,
            double longitud,
            String distritoZona,
            int puntosAcumulados,
            String encodedPassword,
            LocalDateTime now) {
        String emailNormalizado = email.trim().toLowerCase();
        if (usuarioRepository.existsByEmail(emailNormalizado)) {
            return;
        }
        Optional<Zona> zona = findZonaPorDistrito(distritoZona);
        if (zona.isEmpty()) {
            System.out.println("DataInitializer: zona no encontrada para " + distritoZona + ", se omite " + email);
            return;
        }
        saveVecino(
                nombre,
                apellido,
                email,
                telefono,
                direccion,
                latitud,
                longitud,
                zona.get(),
                puntosAcumulados,
                encodedPassword,
                now);
    }

    private void agregarPuntosPrueba(LocalDateTime now) {
        Vecino ana = vecinoRepository
                .findByEmailIgnoreCase("vecino.ana@correo.com")
                .orElse(null);
        Vecino centro = vecinoRepository
                .findByEmailIgnoreCase("vecino.centro@correo.com")
                .orElse(null);
        Vecino sur = vecinoRepository
                .findByEmailIgnoreCase("vecino.sur@correo.com")
                .orElse(null);

        if (ana == null || centro == null || sur == null) {
            System.out.println("DataInitializer: vecinos base no encontrados, se omiten puntos de prueba.");
            return;
        }

        Vecino[] vecinos = {ana, centro, sur};
        Map<Long, Integer> puntosPorVecino = new HashMap<>();

        for (int i = 0; i < 30; i++) {
            Vecino vecino = vecinos[i % 3];
            String tipo = TIPOS_RESIDUO[random.nextInt(TIPOS_RESIDUO.length)];
            double cantidad = 1.0 + (i % 5);
            int puntosOtorgados = configPuntosService.calcularPuntos(tipo, cantidad, null);
            LocalDateTime fecha = now.minusDays(i);

            Puntos registro = new Puntos();
            registro.setVecino(vecino);
            registro.setTipoResiduo(tipo);
            registro.setCantidad(cantidad);
            registro.setPuntosOtorgados(puntosOtorgados);
            registro.setFecha(fecha);
            registro.setDescripcion("Depósito de prueba #" + (i + 1));
            puntosRepository.save(registro);

            puntosPorVecino.merge(vecino.getId(), puntosOtorgados, Integer::sum);
        }

        for (Vecino vecino : vecinos) {
            int sumaInsertada = puntosPorVecino.getOrDefault(vecino.getId(), 0);
            int actuales = vecino.getPuntosAcumulados() != null ? vecino.getPuntosAcumulados() : 0;
            vecino.setPuntosAcumulados(actuales + sumaInsertada);
            vecinoRepository.save(vecino);
        }

        System.out.println("DataInitializer: 30 registros de puntos de prueba insertados.");
    }

    private Optional<Zona> findZonaPorDistrito(String distrito) {
        return zonaRepository.findAll().stream()
                .filter(z -> z.getNombre() != null && z.getNombre().contains(distrito))
                .findFirst();
    }

    private void inicializarConfigPuntos() {
        saveConfigPuntos("GLASS", 15, 30.0, "UNIDAD", true);
        saveConfigPuntos("METAL", 20, 40.0, "UNIDAD", true);
        saveConfigPuntos("PAPER", 8, 16.0, "UNIDAD", true);
        saveConfigPuntos("PET", 12, 25.0, "UNIDAD", true);
        saveConfigPuntos("PLASTIC", 10, 20.0, "UNIDAD", true);
    }

    private void saveConfigPuntos(
            String categoria, int puntosUnidad, double puntosKg, String modoCalculo, boolean activo) {
        ConfigPuntos config = new ConfigPuntos();
        config.setCategoria(categoria);
        config.setPuntosUnidad(puntosUnidad);
        config.setPuntosKg(puntosKg);
        config.setModoCalculo(modoCalculo);
        config.setActivo(activo);
        configPuntosRepository.save(config);
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
