import 'package:go_router/go_router.dart';
import 'package:mobil/modules/auth/pages/login_page.dart';
import 'package:mobil/modules/auth/providers/auth_provider.dart';
import 'package:mobil/modules/vecino/pages/dashboard_page.dart';
import 'package:mobil/modules/vecino/pages/history_page.dart';
import 'package:mobil/modules/vecino/pages/profile_page.dart';
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
      if (loggedIn && isLogin) return '/vecino/home';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
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
                path: '/vecino/history',
                builder: (context, state) => const HistoryPage(),
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
