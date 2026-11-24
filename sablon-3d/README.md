# Șablon „aspect 3D” pentru clipurile noi

`toon.js` de aici e motorul de desen al filmelor (stilul Sci-Fi Sitcom Toon din biblioteca Lemo-Opuscar), cu aspectul „mai 3D” aprobat pentru **clipurile noi**:

- volum pe fiecare formă conturată: lumină sus-stânga, umbră moale jos-dreapta, un mic luciu pe formele mai mici;
- contururi cu ~30% mai subțiri (`S.lwScale = .72`);
- `floorShadow(x, y, rx)`: umbră moale pe podea, sub personaje și mobilă;
- `lightPass()`: lumină caldă și colțuri ușor întunecate, apelat după desenarea scenei (înainte de subtitrări).

Pentru un clip nou: copiază `toon.js` în folderul proiectului, apelează `floorShadow` la începutul fiecărui personaj/obiect care stă pe podea și `lightPass()` în `render()` după scenă. `S.vol = 0` oprește volumul, dacă e nevoie.

„Pe așteptare”, „Telecomanda”, „Liftul”, „Motanul Copiat” și „Tata și parola” rămân în varianta plată, așa cum au fost publicate.
