import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobil/modules/auth/pages/login_page.dart';
import 'package:mobil/modules/auth/providers/auth_provider.dart';
import 'package:mobil/modules/vecino/pages/dashboard_page.dart';
import 'package:mobil/modules/vecino/pages/historial_page.dart';
import 'package:mobil/modules/vecino/pages/profile_page.dart';
import 'package:mobil/modules/vecino/pages/radar_page.dart';
import 'package:mobil/modules/vecino/pages/scan_page.dart';
import 'package:mobil/shared/widgets/vecino_shell.dart';

GoRouter createAppRouter(AuthProvider authProvider) {
  return GoRouter(
    initialLocation: '/login',
    refreshListenable: authProvider,
    redirect: (context, state) {
      final loggedIn = authProvider.isAuthenticated;
      final isLogin = state.matchedLocation == '/login';

      if (!loggedIn && !isLogin) return '/login';
      if (loggedIn && isLogin) {
        final rol = authProvider.rol.toUpperCase();
        if (rol == 'ADMINISTRADOR' || rol == 'OPERADOR') {
          return '/operador/home';
        }
        return '/vecino/home';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/operador/home',
        builder: (context, state) => const Scaffold(
          body: Center(child: Text('Panel operador')),
        ),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return VecinoShell(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/vecino/home',
                builder: (context, state) => const VecinoDashboardPage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/vecino/scan',
                builder: (context, state) => const ScanPage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/vecino/radar',
                builder: (context, state) => const RadarPage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/vecino/history',
                builder: (context, state) => const HistorialPage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/vecino/profile',
                builder: (context, state) => const ProfilePage(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
}
