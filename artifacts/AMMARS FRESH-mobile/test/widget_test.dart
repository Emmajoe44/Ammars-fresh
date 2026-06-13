import 'package:flutter_test/flutter_test.dart';

import 'package:agri_market_mobile/main.dart';

void main() {
  testWidgets('App boots', (WidgetTester tester) async {
    await tester.pumpWidget(const AmmarsFreshApp());
    await tester.pump();
    expect(find.byType(AmmarsFreshApp), findsOneWidget);
  });
}
