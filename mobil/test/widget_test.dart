import 'package:flutter_test/flutter_test.dart';
import 'package:mobil/main.dart';
import 'package:mobil/modules/auth/providers/auth_provider.dart';
import 'package:provider/provider.dart';

void main() {
  testWidgets('Login page se muestra al iniciar', (WidgetTester tester) async {
    final authProvider = AuthProvider();

    await tester.pumpWidget(
      ChangeNotifierProvider.value(
        value: authProvider,
        child: MobilApp(authProvider: authProvider),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Ingresar'), findsOneWidget);
    expect(find.text('Email'), findsOneWidget);
  });
}
