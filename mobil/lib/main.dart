import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:mobil/config/constants.dart';
import 'package:mobil/config/routes.dart';
import 'package:mobil/config/theme.dart';
import 'package:mobil/modules/auth/providers/auth_provider.dart';
import 'package:provider/provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');

  final authProvider = AuthProvider();
  await authProvider.loadSession();

  runApp(
    ChangeNotifierProvider.value(
      value: authProvider,
      child: MobilApp(authProvider: authProvider),
    ),
  );
}

class MobilApp extends StatelessWidget {
  const MobilApp({super.key, required this.authProvider});

  final AuthProvider authProvider;

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: AppConstants.appName,
      theme: AppTheme.light,
      routerConfig: createAppRouter(authProvider),
      debugShowCheckedModeBanner: false,
    );
  }
}
